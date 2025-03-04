import { Component, OnInit } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  response: any = null; // Stores fetched file details

  constructor(private fileService: FileService) {}

  async ngOnInit() {
    try {
      const folder1Files = await this.fileService.listFiles('uploads/');
      const folder2Files = await this.fileService.listFiles('results/');

      this.response = {
        date: new Date().toLocaleString(),
        size: `${folder1Files.length + folder2Files.length} fichiers`,
        status: 'Analyse terminée',
        summary: [...folder1Files.map(f => f.key), ...folder2Files.map(f => f.key)]
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      this.response = {
        status: 'Erreur',
        errors: ['Impossible de récupérer les fichiers S3']
      };
    }
  }
}
