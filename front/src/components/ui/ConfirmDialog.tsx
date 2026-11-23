import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void> | void;
    onClose: () => void;
}

const ConfirmDialog = ({ open, title, message, confirmLabel = "Supprimer", onConfirm, onClose }: ConfirmDialogProps) => {
    const [busy, setBusy] = useState(false);

    const handle = async () => {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="mb-6 flex gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
                    <AlertTriangle className="size-5" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                    Annuler
                </Button>
                <Button variant="danger" loading={busy} onClick={handle}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
