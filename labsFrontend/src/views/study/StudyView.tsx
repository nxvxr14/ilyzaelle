import { useParams, useNavigate } from 'react-router-dom';
import { useStudy } from '@/hooks/useStudy';
import StudyContainer from '@/components/study/StudyContainer';
import CompletionScreen from '@/components/study/CompletionScreen';
import Loading from '@/components/common/Loading';

const StudyView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const {
    cards,
    currentIndex,
    isLoading,
    isCompleted,
    completionData,
    handleAnswer,
    handleAdvance,
    handleComplete,
  } = useStudy(moduleId || '');

  if (isLoading) return <Loading />;

  if (isCompleted && completionData) {
    return (
      <CompletionScreen
        moduleName={'Módulo completado'}
        pointsEarned={completionData.pointsEarned}
        timeTakenMs={completionData.timeTakenMs}
        onContinue={() => navigate(-1)}
      />
    );
  }

  return (
    <StudyContainer
      cards={cards}
      currentIndex={currentIndex}
      moduleId={moduleId || ''}
      onAnswer={handleAnswer}
      onAdvance={handleAdvance}
      onComplete={handleComplete}
    />
  );
};

export default StudyView;
