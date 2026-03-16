import styled from 'styled-components';

export const ContentBorderWrapper = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 9px;
  width: auto;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: left;
  padding: 50px;
  overflow-y: auto;
  gap: 30px;
  background-color: ${(props) => props.theme.colors.background?.content};
  border-radius: 24px;
  width: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    gap: 16px;
    padding: 40px 24px;
  }
`;

export const ContentTitle = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  color: ${(props) => props.theme.colors.text.default} !important;
  text-align: center;
`;

export const ContentText = styled.p`
  font-size: ${(props) => props.theme.fontSizes.small};
  line-height: 1.5;
  font-weight: medium;
  margin: 0;
  color: ${(props) => props.theme.colors.text.default} !important;
  text-align: center;
`;

export const Card = styled.div`
  background: ${(props) => props.theme.colors.card.default};
  border-radius: 24px;
  padding: 50px;
  box-shadow: ${(props) => props.theme.shadows.default};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 350px;
  max-width: ${(props) => props.$maxWidth || '400px'};
  width: ${(props) => props.$width || 'auto'};

  ${({ theme }) => theme.mediaQueries.small} {
    padding: 40px 24px;
    min-width: 300px;
    max-width: 350px;
  }
`;

export const CardsContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: ${(props) => props.$justifyContent || 'center'};
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    align-items: center;
  }
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  ${({ theme }) => theme.mediaQueries.small} {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

export const FormLabel = styled.label`
  font-weight: 600;
  color: ${(props) => props.theme.colors.text.default};
  font-size: ${(props) => props.theme.fontSizes.small};
  white-space: nowrap;
  flex-shrink: 0;

  ${({ theme }) => theme.mediaQueries.small} {
    margin-bottom: 0.5rem;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${(props) =>
    props.theme.colors.text.default === '#FFFFFF'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 12px;
  font-size: ${(props) => props.theme.fontSizes.small};
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: ${(props) =>
    props.theme.colors.text.default === '#FFFFFF'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'};
  color: ${(props) => props.theme.colors.text.default};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary.default};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.secondary.default10};
    background-color: ${(props) =>
    props.theme.colors.text.default === '#FFFFFF'
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.08)'};
  }

  &::placeholder {
    color: ${(props) =>
    props.theme.colors.text.default === '#FFFFFF'
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(0, 0, 0, 0.4)'};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: ${(props) => props.$justifyContent || 'flex-start'};

  ${({ theme }) => theme.mediaQueries.small} {
    flex-wrap: wrap;
  }
`;

export const StatusMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  font-size: 0.85rem;
  background-color: ${(props) => {
    if (props.$variant === 'success') return props.theme.colors.secondary.default10;
    if (props.$variant === 'error') return props.theme.colors.error.default10;
    return 'rgba(128, 128, 128, 0.2)';
  }};
  color: ${(props) => {
    if (props.$variant === 'success') return props.theme.colors.primary.default;
    if (props.$variant === 'error') return props.theme.colors.error.default;
    return props.theme.colors.text.default;
  }};
  border: 1px solid ${(props) => {
    if (props.$variant === 'success') return props.theme.colors.primary.default;
    if (props.$variant === 'error') return props.theme.colors.error.default;
    return 'rgba(128, 128, 128, 0.3)';
  }};
`;

export const InfoBox = styled.div`
  padding: 1.5rem;
  background-color: ${(props) => props.theme.colors.secondary.default10};
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.primary.default};
  margin-bottom: 2rem;
  font-family: ${(props) => props.theme.fonts.default};
  line-height: 1.8;
`;

export const InfoTitle = styled.div`
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text.default} !important;
  line-height: 1.4;
`;

export const InfoText = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text.default} !important;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const List = styled.ul`
  margin-left: 1.5rem;
  line-height: 1.6;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text.default} !important;
`;

export const ListItem = styled.li`
  color: ${(props) => props.theme.colors.text.default} !important;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

export const Link = styled.a`
  color: ${(props) => props.theme.colors.primary.default} !important;
  text-decoration: none;
  word-break: break-all;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.colors.primary.hover} !important;
  }
`;
