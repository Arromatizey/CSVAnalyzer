import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../services/file.service';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile?: File;
  response?: any;
  uploadStatus: 'En cours...' | 'Succès' | 'Erreur' | null = null;
  uploadStatusMessage = '';
  responsee: any = null; // Stores fetched file details

  constructor(private fileService: FileService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async uploadFile() {
    if (this.selectedFile) {
      try {
        this.uploadStatus = 'En cours...';
        this.uploadStatusMessage = '📡 Upload en cours...';
        await this.fileService.uploadFile(this.selectedFile);
        this.uploadStatus = 'Succès';
        this.uploadStatusMessage = '✅ Fichier envoyé avec succès!';
      } catch (error) {
        this.uploadStatus = 'Erreur';
        this.uploadStatusMessage = '❌ Erreur lors de l’envoi du fichier.';
      }
    }
    try {
      const uploads = await this.fileService.listFiles('uploads/');
      const reports = await this.fileService.listFiles('reports/');

      console.log('uploads:', uploads);
      console.log('reports:', reports);
      this.responsee = {
        date: new Date().toLocaleString(),
        size: `${uploads.length + reports.length} fichiers`,
        status: 'Analyse terminée',
        summary: [...uploads.map(f => f.key), ...reports.map(f => f.key)]
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      this.responsee = {
        status: 'Erreur',
        errors: ['Impossible de récupérer les fichiers S3']
      };
    }
  }

  // Drag & Drop Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }
}
