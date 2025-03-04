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

  loading = false; // Gère l'écran de chargement

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
    // Si aucun fichier sélectionné, on sort
    if (!this.selectedFile) {
      return;
    }

    // On active le loading
    this.loading = true;
    this.uploadStatus = 'En cours...';
    this.uploadStatusMessage = '📡 Upload en cours...';

    try {
      // 1) Upload S3
      await this.fileService.uploadFile(this.selectedFile);

      // Upload terminé : on met un message de succès (mais on reste en "loading" pour la partie analyse)
      this.uploadStatus = 'Succès';
      this.uploadStatusMessage = '✅ Fichier envoyé avec succès!';

      // 2) (Optionnel) Petite pause simulée pour l'exemple
      await this.sleep(5000);

      // 3) Lister tous les reports S3
      const reports = await this.fileService.listFiles('reports/');
      console.log('reports:', reports);

      if (reports.length > 0) {
        // Trier du plus récent au plus ancien
        reports.sort((a: any, b: any) => {
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        });

        // Prendre le plus récent
        const lastReport = reports[0];
        if (lastReport.content) {
          let parsedJson = JSON.parse(lastReport.content);

          // Si c'est un seul objet => on le force en tableau
          if (!Array.isArray(parsedJson)) {
            parsedJson = [parsedJson];
          }

          // On construit lastAnalysis
          this.lastAnalysis = parsedJson.map((item: any) => ({
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
          }));

          // Historique complet
          this.analysisHistory = reports.map(r => JSON.parse(<any>r.content));
        }
      }

      // Par exemple, on peut remettre selectedFile à null si on veut enchaîner.
      // this.selectedFile = undefined;

    } catch (error) {
      this.uploadStatus = 'Erreur';
      this.uploadStatusMessage = '❌ Erreur lors de l’envoi ou l’analyse.';
      console.error('Error fetching reports:', error);
    } finally {
      // Quoiqu’il arrive, on désactive le loading
      this.loading = false;
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
