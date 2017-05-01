import {Component} from '@angular/core';
import NewTaskTemplate from '../templates/newTask.html';
import ProjectService from '../services/project.service';

@Component({
    selector: 'newTask',
    inputs: ['task'],
    template: NewTaskTemplate
})
export default class NewTaskComponent {
    constructor(projectService) {
        this.setNewTask()
        this.projectService = projectService
    }

    setNewTask() {
        this.data = {title: '', description: ''}
    }

    create_task() {
        if (!this.data.category)
            this.data.category = this.task.allowedCategories[0]
        this.projectService.create_task(this.task, this.data)
        this.setNewTask()
    }
}

NewTaskComponent.parameters = [
    ProjectService
]
