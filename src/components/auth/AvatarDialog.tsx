import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AvatarDialogProps {
  children: React.ReactNode;
  avatars: string[];
  onSelect: (avatarUrl: string) => void;
}

export function AvatarDialog({ children, avatars, onSelect }: AvatarDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecciona tu avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => onSelect(avatar)}
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="rounded-full object-cover h-20 w-20"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}