import { Dialog as DialogPrimitive } from 'bits-ui';
import DialogContent from './DialogContent.svelte';
import DialogHeader from './DialogHeader.svelte';
import DialogTitle from './DialogTitle.svelte';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle };
