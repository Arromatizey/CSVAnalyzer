import {Component, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../services/file.service';
import {resolve} from 'node:path';
//import {error} from '@angular/compiler-cli/src/transformers/util';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  get parsedJson(): any {
    return this._parsedJson;
  }

  set parsedJson(value: any) {
    this._parsedJson = value;
  }

  lastAnalysis: any = null;       // Contient l’objet du dernier rapport analysé
  analysisHistory: any[] = [];    // Contient l’historique complet des rapports
  showHistoryModal = false;       // Gère l'ouverture/fermeture de la popup

  selectedFile?: File;
  response?: any;
  uploadStatus: 'En cours...' | 'Succès' | 'Erreur' | null = null;
  uploadStatusMessage = '';
  responsee: any = null; // Stores fetched file details
  private _parsedJson: any;
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
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
        console.log('this.selectedFile:', this.selectedFile.name);
        this.uploadStatusMessage = '✅ Fichier envoyé avec succès!';
      } catch (error) {
        this.uploadStatus = 'Erreur';
        this.uploadStatusMessage = '❌ Erreur lors de l’envoi du fichier.';
      }
    }
    await this.sleep(5000);

    try {
      const reports = await this.fileService.listFiles('reports/');
      console.log('reports:', reports);

      if (reports.length > 0) {
   
      
        const fileName = this.selectedFile ? this.selectedFile.name.replace(/\.[^/.]+$/, "") : "";
        console.log('fileName:', fileName);
        const lastReport = reports.find(report => this.selectedFile && report.key.includes(fileName));
        if (lastReport && lastReport.content != null) {
          let parsedJson = JSON.parse(lastReport.content);

          // 3) Forcer en tableau si c'est un objet
          if (!Array.isArray(parsedJson)) {
            parsedJson = [parsedJson];
          }

          // 4) Build lastAnalysis
          this.lastAnalysis = parsedJson.map((item: any) => {
            return {
              fichier: item.fichier,
              statistiques: {
                Prix: {
                  moyenne: item.statistiques?.Prix?.moyenne,
                  ["médiane"]: item.statistiques?.Prix?.["médiane"],
                  ["écart_type"]: item.statistiques?.Prix?.["écart_type"]
                },
                ["Quantité"]: {
                  moyenne: item.statistiques?.Quantité?.moyenne,
                  ["médiane"]: item.statistiques?.Quantité?.["médiane"],
                  ["écart_type"]: item.statistiques?.Quantité?.["écart_type"]
                },
                ["Note_Client"]: {
                  moyenne: item.statistiques?.Note_Client?.moyenne,
                  ["médiane"]: item.statistiques?.Note_Client?.["médiane"],
                  ["écart_type"]: item.statistiques?.Note_Client?.["écart_type"]
                }
              },
              anomalies: {
                ["prix"]: item.anomalies?.["prix"] ?? [],
                ["quantité"]: item.anomalies?.["quantité"] ?? [],
                ["Note_Client"]: item.anomalies?.["Note_Client"] ?? []
              }
            };
          });

          // 5) Historique (si vous voulez tous les rapports)
          this.analysisHistory = reports.map(r => JSON.parse(<any>r.content));

          console.log('Dernière analyse:', this.lastAnalysis);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }

  downloadLastAnalysisAsJson() {
    if (!this.lastAnalysis || this.lastAnalysis.length === 0) {
      return; // Rien à télécharger
    }

    // Convertir le "dernier rapport" (this.lastAnalysis) en JSON "joli"
    const jsonData = JSON.stringify(this.lastAnalysis, null, 2);

    // Créer un blob
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Créer un <a> caché qui déclenche le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dernier_rapport.json'; // Nom du fichier
    link.click();

    // Nettoyer l’URL blob
    URL.revokeObjectURL(url);
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
