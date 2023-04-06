import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl  } from '@angular/forms';
import { Shape, Circle, Square, Rectangle } from './shape.model';
import { ShapesService } from './shapes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  shapesList!: Shape[];
  shapesListForm: FormGroup = this.fb.group({
		shapes: this.fb.array([])
	});
  submitted = false;

  private pi = 3.14159265358979323846;

  constructor(private shapesService: ShapesService, private fb: FormBuilder) {}

	get shapes() {
		return this.shapesListForm.get('shapes') as FormArray;
	}
	
  ngOnInit() {
    this.shapesService.getShapes()
      .subscribe((shapes: Shape[]) => {
        this.shapesList = shapes;

        shapes.forEach((shape) => {
          this.shapes.push(this.createShapeForm(shape));
        })

      });

      this.shapesListForm.valueChanges.subscribe(() => {
       this.submitted = false;
    })
  }

  addShapeControl() {
		const shapeGroup = this.fb.group({
			type: ['', Validators.required],
      newShape: [true],
		});
		this.shapes.push(shapeGroup);
	}

  addSpecificShapeControls(index: number) {
    const shape: Shape = {_type: this.shapes.at(index).value.type };
    this.deleteShapeControl(index);
		this.shapes.insert(index, this.createShapeForm(shape, true))
	}

	deleteShapeControl(index: number) {
		this.shapes.removeAt(index);
	}

	onFormSubmit() {
		if (this.shapesListForm.valid) {
      this.submitted = true;
      this.shapesService.saveShapes(this.shapes.value)
		} else {
      this.markAllControlsAsDirty([this.shapesListForm])
    }
	}

   calculateCircleArea(r: number) {
		return (this.pi * r * r).toFixed(2);
	}

   calculateRectangleArea(w: number, l?: number) {
    if (!!l) { 
      return (w * l).toFixed(2);
    }
		return (w * w).toFixed(2);
	}

  private createShapeForm(shape: Shape, newShape: boolean = false): FormGroup {
    const type = shape._type;
    if (type === 'Circle') {
     return  this.fb.group({
        type: [type],
        newShape: [newShape],
        radius: [(shape as Circle).radius, [Validators.required, Validators.min(0)]]
      })
    } else if (shape._type === 'Square') {
      return this.fb.group({
        type: [type],
        newShape: [newShape],
        size: [(shape as Square).size, [Validators.required,  Validators.min(0)]]
      })
    } else {
      return this.fb.group({
        type: [type],
        newShape: [newShape],
        width: [(shape as Rectangle).width, [Validators.required,  Validators.min(0)]],
        length: [(shape as Rectangle).length, [Validators.required,  Validators.min(0)]]
      })
    }
  }

  private  markAllControlsAsDirty(controls: AbstractControl[]): void {
    controls.forEach((control) => {
      if (control instanceof FormControl) {
        (control as FormControl).markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAllControlsAsDirty(
          Object.values((control as FormGroup).controls)
        );
      } else if (control instanceof FormArray) {
        this.markAllControlsAsDirty((control as FormArray).controls);
      }
    });
  }
}
