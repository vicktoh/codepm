import React, { FC } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { addProject,  editProject } from '../services/projectServices';
import { Project } from '../types/Project';

type ProjectFormType = {
   onClose: () => void;
   mode: 'add' | 'edit';
   project?: Project

}
export const ProjectForm: FC<ProjectFormType> = ({
    onClose = () => null,
    mode,
    project
}) => {
   
   
    const toast = useToast();
    const validationSchema = yup.object().shape({
        title: yup.string().required("This field is required").min(5, 'Must be at least 5 characters'),
        description: yup
            .string()
            .required('This field is required')
            .min(100, 'Must be at least 100 digits').max(1500, "Cannot be above 1500 characters"),
        funder: yup.string().required('This field is required'),
    });
    const initialValues: Omit<Project, 'id' | 'dateAdded'> = {
       title: project?.title || "",
       description: project?.description || "",
       funder: project?.funder || "",
    };
    

    return (
        <Formik
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
               console.log('hey there')
                if(mode === "add"){
                  
                   try {
                      await addProject(values);
                      toast({title: "Successfully added project", status: "success"})

                   } catch (error) {
                      let err: any = error;
                      toast({title: "Could not Add Proposal", description: err?.message || "Unknown Error", status: "error"})
                   }
                   finally{
                      onClose();
                   }
                }
                if(mode === "edit"){
                    try {
                        await editProject({...project, ...values});
                        toast({title: "Successfully edited project", status: "success"});
                    } catch (error) {
                        let err: any = error;
                        toast({title: "Could not Add Proposal", description: err?.message || "Unknown Error", status: "error"})
                     }
                     finally{
                        onClose();
                     }
                }
            }}
            initialValues={initialValues}
        >
            {({
                handleBlur,
                handleChange,
                values,
                touched,
                errors,
                isSubmitting,
                setFieldValue
            }) => (
                <Flex direction="column" px={3} pb={5}>
                    <Form>
                        <FormControl
                            isRequired
                            isInvalid={
                                !!touched.title && !!errors.title
                            }
                            mb={3}
                        >
                            <FormLabel>Title</FormLabel>
                            <Input
                                name="title"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <FormErrorMessage>
                                {touched.title && errors.title}
                            </FormErrorMessage>
                        </FormControl>
                        <FormControl
                            isRequired
                            isInvalid={
                                !!touched.description && !!errors.description
                            }
                            mb={3}
                        >
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <FormHelperText>Minimum 100 character and Max 300 character</FormHelperText>
                            
                            <FormErrorMessage>
                                {touched.description && errors.description}
                            </FormErrorMessage>
                        </FormControl>
                        <FormControl
                            isRequired
                            isInvalid={
                                !!touched.funder && !!errors.funder
                            }
                            mb={3}
                        >
                            <FormLabel>Funder</FormLabel>
                            <Input
                                name="funder"
                                value={values.funder}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            <FormErrorMessage>
                                {touched.funder && errors.funder}
                            </FormErrorMessage>
                        </FormControl>
                       
                        <Flex direction="column" mt={3}>
                            <Button
                                type="submit"
                                colorScheme="brand"
                                isLoading={isSubmitting}
                            >
                                Save
                            </Button>
                        </Flex>
                    </Form>
                </Flex>
            )}
        </Formik>
    );
};
