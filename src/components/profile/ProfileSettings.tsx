import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '../../lib/firebase-auth-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export function ProfileSettings() {
  const { user, updateUserProfile, updateUserEmail, updateUserPassword, logOut } = useFirebaseAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile fields
  const [name, setName] = useState(user?.displayName || '');
  
  // Email change fields
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'profile' | 'email' | 'password'>('profile');

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await updateUserProfile({ name });
      if (success) {
        setSuccess('Профилът беше успешно обновен.');
        setShowConfirmation(false);
      } else {
        setError('Не успяхме да обновим профила.');
      }
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при обновяването на профила.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (newEmail === user?.email) {
      setShowEmailChange(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await updateUserEmail(newEmail, emailPassword);
      if (success) {
        setSuccess('Имейлът беше успешно обновен. Моля, влезте отново с новия имейл.');
        setShowConfirmation(false);
        setEmailPassword('');
        setShowEmailChange(false);
        // Log out user after email change
        setTimeout(() => {
          logOut();
          window.location.href = '/';
        }, 3000);
      } else {
        setError('Не успяхме да обновим имейла. Моля, проверете паролата.');
      }
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при обновяването на имейла.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Паролите не съвпадат.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Новата парола трябва да бъде поне 6 символа.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await updateUserPassword(currentPassword, newPassword);
      if (success) {
        setSuccess('Паролата беше успешно обновена. Моля, влезте отново с новата парола.');
        setShowConfirmation(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
        // Log out user after password change
        setTimeout(() => {
          logOut();
          window.location.href = '/';
        }, 3000);
      } else {
        setError('Не успяхме да обновим паролата. Моля, проверете текущата парола.');
      }
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при обновяването на паролата.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmationAction === 'profile') {
      handleUpdateProfile();
    } else if (confirmationAction === 'email') {
      handleUpdateEmail();
    } else if (confirmationAction === 'password') {
      handleUpdatePassword();
    }
  };

  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-lg font-medium">Настройки на профила</h3>
        <p className="text-sm text-muted-foreground">
          Управлявайте настройките на профила си
        </p>
      </div>
      
      <Separator />
      
      {success && (
        <div className="bg-green-500/20 text-green-300 p-3 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Име</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/40 border-purple-500/30"
          />
        </div>
        
        <Button 
          onClick={() => {
            setConfirmationAction('profile');
            setShowConfirmation(true);
          }}
          className="bg-purple-500 hover:bg-purple-600"
        >
          Запази промените
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium">Имейл адрес</h4>
            <p className="text-sm text-muted-foreground">
              Текущ имейл: {user.email}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowEmailChange(!showEmailChange)}
            className="border-purple-500/30 hover:bg-purple-500/20"
          >
            {showEmailChange ? 'Отказ' : 'Промяна'}
          </Button>
        </div>
        
        {showEmailChange && (
          <div className="space-y-4 border border-purple-500/20 rounded-lg p-4 bg-black/20">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Нов имейл адрес</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-black/40 border-purple-500/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Текуща парола</Label>
              <Input
                id="emailPassword"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="bg-black/40 border-purple-500/30"
              />
            </div>
            
            <Button 
              onClick={() => {
                setConfirmationAction('email');
                setShowConfirmation(true);
              }}
              disabled={!newEmail || !emailPassword || newEmail === user.email}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Обнови имейл
            </Button>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium">Парола</h4>
            <p className="text-sm text-muted-foreground">
              Променете паролата си за по-голяма сигурност
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="border-purple-500/30 hover:bg-purple-500/20"
          >
            {showPasswordChange ? 'Отказ' : 'Промяна'}
          </Button>
        </div>
        
        {showPasswordChange && (
          <div className="space-y-4 border border-purple-500/20 rounded-lg p-4 bg-black/20">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текуща парола</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-black/40 border-purple-500/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Нова парола</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black/40 border-purple-500/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потвърди нова парола</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/40 border-purple-500/30"
              />
            </div>
            
            <Button 
              onClick={() => {
                setConfirmationAction('password');
                setShowConfirmation(true);
              }}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Обнови парола
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-gray-900 border border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Потвърдете промените</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === 'profile'
                ? 'Сигурни ли сте, че искате да обновите профила си?'
                : confirmationAction === 'email'
                ? 'Промяната на имейл адреса ще изисква повторно влизане в системата. Продължавате ли?'
                : 'Промяната на паролата ще изисква повторно влизане в системата. Продължавате ли?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-500/30 hover:bg-purple-500/20">
              Отказ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Обработка...
                </>
              ) : 'Потвърждавам'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}