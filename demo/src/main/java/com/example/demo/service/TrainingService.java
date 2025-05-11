package com.example.demo.service;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.dto.responses.ApiResponse;
import com.example.demo.model.*;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class    TrainingService {
    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    // Méthode pour récupérer toutes les formations
    public List<Training> getAllTrainning() {
        return trainingRepository.findAll();
    }

    public ApiResponse<Training> createTraining(TrainingCreateDTO dto) {
        // 1) Valider que la date de formation n'est pas dans le passé
        LocalDate currentDate = LocalDate.now();
        if (dto.getDate().isBefore(currentDate)) {
            return ApiResponse.error("La date de formation doit être supérieure ou égale à la date actuelle", HttpStatus.BAD_REQUEST);
        }

        // 2) Vérifier les chevauchements de formations à la même date
        List<Training> trainingsOnSameDate = trainingRepository.findAllByDate(dto.getDate());

        if (!trainingsOnSameDate.isEmpty()) {
            // Si nous avons des sessions, il faut vérifier les chevauchements de temps
            if (dto.getSessions() != null && !dto.getSessions().isEmpty()) {
                ApiResponse<Void> overlapCheck = checkSessionsOverlap(trainingsOnSameDate, dto.getSessions());
                if (!overlapCheck.isSuccess()) {
                    return ApiResponse.error(overlapCheck.getMessage(), overlapCheck.getStatus());
                }
            } else {
                return ApiResponse.error("Une formation existe déjà à la date: " + dto.getDate(), HttpStatus.CONFLICT);
            }
        }

        // 3) Valider les sessions pour les chevauchements internes (si plusieurs sessions sont fournies)
        if (dto.getSessions() != null && dto.getSessions().size() > 1) {
            ApiResponse<Void> internalOverlapCheck = checkInternalSessionsOverlap(dto.getSessions());
            if (!internalOverlapCheck.isSuccess()) {
                return ApiResponse.error(internalOverlapCheck.getMessage(), internalOverlapCheck.getStatus());
            }
        }

        // 4) Trouver le formateur par email
        Optional<User> formateurOpt = userRepository.findByEmail(dto.getFormateurEmail());
        if (formateurOpt.isEmpty()) {
            return ApiResponse.error("Aucun utilisateur trouvé avec l'email: " + dto.getFormateurEmail(), HttpStatus.NOT_FOUND);
        }
        User formateur = formateurOpt.get();

        // 5) Construire la formation
        Training training = new Training();
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());

        // 6) Définir les relations
        training.setFormateur(formateur);

        // 7) Mapper et ajouter les sessions
        if (dto.getSessions() != null) {
            for (TrainingSessionDTO s : dto.getSessions()) {
                TrainingSession session = new TrainingSession();

                Optional<Room> roomOpt = roomRepository.findById(s.getRoomId());
                if (roomOpt.isEmpty()) {
                    return ApiResponse.error("Aucune salle trouvée avec l'id " + s.getRoomId(), HttpStatus.NOT_FOUND);
                }
                Room room = roomOpt.get();

                // Valider que la date de session n'est pas antérieure à la date de formation
                if (s.getDate().isBefore(dto.getDate())) {
                    return ApiResponse.error("La date de session ne peut pas être antérieure à la date de formation", HttpStatus.BAD_REQUEST);
                }

                session.setRoom(room);
                session.setDate(s.getDate());
                session.setTimeStart(s.getTimeStart());
                session.setTimeEnd(s.getTimeEnd());
                session.setLinkMeet(s.getLinkMeet());

                try {
                    session.setType(SessionType.valueOf(s.getType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ApiResponse.error("Type de session invalide: " + s.getType(), HttpStatus.BAD_REQUEST);
                }

                // Valider la plage horaire
                if (s.getTimeStart().isAfter(s.getTimeEnd()) || s.getTimeStart().equals(s.getTimeEnd())) {
                    return ApiResponse.error("L'heure de début de session doit être antérieure à l'heure de fin", HttpStatus.BAD_REQUEST);
                }

                training.addSession(session);
            }
        }

        // 8) Persister
        Training savedTraining = trainingRepository.save(training);
        return ApiResponse.success("Formation créée avec succès", savedTraining);
    }

    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    public ApiResponse<Training> getTrainingById(Long id) {
        Optional<Training> trainingOpt = trainingRepository.findById(id);
        if (trainingOpt.isEmpty()) {
            return ApiResponse.error("Formation non trouvée avec l'id: " + id, HttpStatus.NOT_FOUND);
        }
        return ApiResponse.success(trainingOpt.get());
    }

    public ApiResponse<Training> updateTraining(Long id, TrainingCreateDTO dto) {
        // 1. Valider que la date de formation n'est pas dans le passé
        LocalDate currentDate = LocalDate.now();
        if (dto.getDate().isBefore(currentDate)) {
            return ApiResponse.error("La date de formation doit être supérieure ou égale à la date actuelle", HttpStatus.BAD_REQUEST);
        }

        // 2. Récupérer la formation existante
        Optional<Training> trainingOpt = trainingRepository.findById(id);
        if (trainingOpt.isEmpty()) {
            return ApiResponse.error("Formation non trouvée avec l'id: " + id, HttpStatus.NOT_FOUND);
        }
        Training training = trainingOpt.get();

        // 3. Vérifier les chevauchements de formations à la même date (en excluant cette formation)
        List<Training> trainingsOnSameDate = trainingRepository.findAllByDate(dto.getDate()).stream()
                .filter(t -> !t.getId().equals(id))
                .collect(Collectors.toList());

        if (!trainingsOnSameDate.isEmpty()) {
            // Si nous avons des sessions, il faut vérifier les chevauchements de temps
            if (dto.getSessions() != null && !dto.getSessions().isEmpty()) {
                ApiResponse<Void> overlapCheck = checkSessionsOverlap(trainingsOnSameDate, dto.getSessions());
                if (!overlapCheck.isSuccess()) {
                    return ApiResponse.error(overlapCheck.getMessage(), overlapCheck.getStatus());
                }
            } else {
                return ApiResponse.error("Une autre formation existe déjà à la date: " + dto.getDate(), HttpStatus.CONFLICT);
            }
        }

        // 4. Valider les sessions pour les chevauchements internes (si plusieurs sessions sont fournies)
        if (dto.getSessions() != null && dto.getSessions().size() > 1) {
            ApiResponse<Void> internalOverlapCheck = checkInternalSessionsOverlap(dto.getSessions());
            if (!internalOverlapCheck.isSuccess()) {
                return ApiResponse.error(internalOverlapCheck.getMessage(), internalOverlapCheck.getStatus());
            }
        }

        // 5. Mettre à jour les propriétés de base de la formation
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());

        // Mettre à jour le formateur
        Optional<User> formateurOpt = userRepository.findByEmail(dto.getFormateurEmail());
        if (formateurOpt.isEmpty()) {
            return ApiResponse.error("Aucun utilisateur trouvé avec l'email: " + dto.getFormateurEmail(), HttpStatus.NOT_FOUND);
        }
        training.setFormateur(formateurOpt.get());

        // 6. Traiter les sessions
        Map<Long, TrainingSession> existingSessions = training.getSessions().stream()
                .filter(session -> session.getId() != null)
                .collect(Collectors.toMap(TrainingSession::getId, Function.identity()));

        List<TrainingSession> updatedSessions = new ArrayList<>();

        if (dto.getSessions() != null) {
            for (TrainingSessionDTO sessionDTO : dto.getSessions()) {
                TrainingSession session;
                if (sessionDTO.getId() != null && existingSessions.containsKey(sessionDTO.getId())) {
                    // Trouvé une session existante; mettre à jour ses champs
                    session = existingSessions.get(sessionDTO.getId());
                } else {
                    // Pas de session existante avec cet ID, donc créer une nouvelle session
                    session = new TrainingSession();
                }

                // Valider que la date de session n'est pas antérieure à la date de formation
                if (sessionDTO.getDate().isBefore(dto.getDate())) {
                    return ApiResponse.error("La date de session ne peut pas être antérieure à la date de formation", HttpStatus.BAD_REQUEST);
                }

                // Valider la plage horaire
                if (sessionDTO.getTimeStart().isAfter(sessionDTO.getTimeEnd()) ||
                        sessionDTO.getTimeStart().equals(sessionDTO.getTimeEnd())) {
                    return ApiResponse.error("L'heure de début de session doit être antérieure à l'heure de fin", HttpStatus.BAD_REQUEST);
                }

                // Mettre à jour les champs de session communs
                Optional<Room> roomOpt = roomRepository.findById(sessionDTO.getRoomId());
                if (roomOpt.isEmpty()) {
                    return ApiResponse.error("Aucune salle trouvée avec l'id: " + sessionDTO.getRoomId(), HttpStatus.NOT_FOUND);
                }
                session.setRoom(roomOpt.get());
                session.setDate(sessionDTO.getDate());
                session.setTimeStart(sessionDTO.getTimeStart());
                session.setTimeEnd(sessionDTO.getTimeEnd());
                session.setLinkMeet(sessionDTO.getLinkMeet());

                try {
                    session.setType(SessionType.valueOf(sessionDTO.getType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ApiResponse.error("Type de session invalide: " + sessionDTO.getType(), HttpStatus.BAD_REQUEST);
                }

                updatedSessions.add(session);
            }
        }

        // Remplacer les sessions
        training.getSessions().clear();
        for (TrainingSession session : updatedSessions) {
            training.addSession(session);
        }

        // 7. Sauvegarder et retourner l'entité de formation mise à jour
        Training savedTraining = trainingRepository.save(training);
        return ApiResponse.success("Formation mise à jour avec succès", savedTraining);
    }

    // Supprimer une formation par ID
    public ApiResponse<Void> deleteTraining(Long id) {
        Optional<Training> trainingOpt = trainingRepository.findById(id);
        if (trainingOpt.isEmpty()) {
            return ApiResponse.error("Formation non trouvée avec l'id: " + id, HttpStatus.NOT_FOUND);
        }
        trainingRepository.delete(trainingOpt.get());
        return ApiResponse.success("Formation supprimée avec succès", null);
    }

    /**
     * Vérifier s'il y a des chevauchements de sessions au sein de la même formation
     */
    private ApiResponse<Void> checkInternalSessionsOverlap(List<TrainingSessionDTO> sessions) {
        for (int i = 0; i < sessions.size(); i++) {
            TrainingSessionDTO session1 = sessions.get(i);

            for (int j = i + 1; j < sessions.size(); j++) {
                TrainingSessionDTO session2 = sessions.get(j);

                // Vérifier si les sessions sont à la même date et dans la même salle
                if (session1.getDate().isEqual(session2.getDate()) &&
                        session1.getRoomId().equals(session2.getRoomId())) {

                    // Vérifier le chevauchement de temps
                    boolean overlapExists =
                            (session1.getTimeStart().isBefore(session2.getTimeEnd()) ||
                                    session1.getTimeStart().equals(session2.getTimeEnd())) &&
                                    (session1.getTimeEnd().isAfter(session2.getTimeStart()) ||
                                            session1.getTimeEnd().equals(session2.getTimeStart()));

                    if (overlapExists) {
                        return ApiResponse.error("Les sessions au sein de la même formation se chevauchent dans la salle ID " +
                                session1.getRoomId() + " le " + session1.getDate(), HttpStatus.CONFLICT);
                    }
                }
            }
        }
        return ApiResponse.success("Pas de chevauchement", null);
    }

    /**
     * Vérifier s'il y a des chevauchements de sessions entre les sessions de formation existantes
     * et les nouvelles sessions de formation
     */
    private ApiResponse<Void> checkSessionsOverlap(List<Training> existingTrainings, List<TrainingSessionDTO> newSessionDTOs) {
        for (Training existingTraining : existingTrainings) {
            for (TrainingSession existingSession : existingTraining.getSessions()) {
                for (TrainingSessionDTO newSessionDTO : newSessionDTOs) {
                    // Vérifier si les sessions sont à la même date et dans la même salle
                    if (existingSession.getDate().isEqual(newSessionDTO.getDate()) &&
                            existingSession.getRoom().getId().equals(newSessionDTO.getRoomId())) {

                        // Vérifier le chevauchement de temps
                        boolean overlapExists =
                                (newSessionDTO.getTimeStart().isBefore(existingSession.getTimeEnd()) ||
                                        newSessionDTO.getTimeStart().equals(existingSession.getTimeEnd())) &&
                                        (newSessionDTO.getTimeEnd().isAfter(existingSession.getTimeStart()) ||
                                                newSessionDTO.getTimeEnd().equals(existingSession.getTimeStart()));

                        if (overlapExists) {
                            return ApiResponse.error("La session chevauche une session existante dans la salle " +
                                    existingSession.getRoom().getName() + " le " + existingSession.getDate() +
                                    " de " + existingSession.getTimeStart() + " à " + existingSession.getTimeEnd(), HttpStatus.CONFLICT);
                        }
                    }
                }
            }
        }
        return ApiResponse.success("Pas de chevauchement", null);
    }
}
