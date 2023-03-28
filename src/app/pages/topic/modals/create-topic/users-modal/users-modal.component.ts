import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Item } from 'src/app/models/item';

@Component({
  selector: 'app-users-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, NgIf, NgFor],
  templateUrl: './users-modal.component.html',
  styleUrls: ['./users-modal.component.scss'],
})
export class UsersModalComponent implements OnInit {

  private modalCtrl = inject(ModalController);

  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  droitUsers = new FormControl('');
  filteredItems: Item[] = [];
  workingSelectedValues: string[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
    this.workingSelectedValues = [...this.selectedItems];
  }

  trackItems(index: number, item: Item) {
    return item.value;
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    let userRight:any[]=[];
    this.items.forEach(item => {
      this.workingSelectedValues.forEach(elm=>{
        if(item.value == elm){
          userRight.push({user:item.value,right:item.right});
        }
      })

    })

    this.selectionChange.emit(userRight);
    this.modalCtrl.dismiss();
  }

  selectionUsersChange(value:any){
    let tab:string[] = value.detail.value.split('-');
    this.items.forEach(item => {
      if(item.value == tab[0] ){
        item.right=tab[1];
      }
    });
  }

  searchbarInput(ev:any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */

      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.items.filter(item => {
        return item.value.includes(normalizedQuery);
      });
    }
  }

  isChecked(value: string) {
    return this.workingSelectedValues.find(item => item === value);
  }

  checkboxChange(ev:any) {
    const { checked, value } = ev.detail;

    if (checked) {
      this.workingSelectedValues = [
        ...this.workingSelectedValues,
        value
      ]
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter(item => item !== value);
    }
  }




}
