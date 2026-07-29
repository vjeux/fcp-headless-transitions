__ZN13HGColorMatrix6RotateEffff:
00000000001b8640	pushq	%rbp
00000000001b8641	movq	%rsp, %rbp
00000000001b8644	pushq	%rbx
00000000001b8645	subq	$0x38, %rsp
00000000001b8649	movaps	%xmm3, -0x40(%rbp)
00000000001b864d	movaps	%xmm2, -0x30(%rbp)
00000000001b8651	movaps	%xmm1, -0x20(%rbp)
00000000001b8655	movq	%rdi, %rbx
00000000001b8658	mulss	0x219d20(%rip), %xmm0
00000000001b8660	callq	0x3c502a                        ## symbol stub for: ___sincosf_stret
00000000001b8665	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000001b8669	movaps	-0x20(%rbp), %xmm11
00000000001b866e	movaps	%xmm11, %xmm3
00000000001b8672	movaps	-0x30(%rbp), %xmm9
00000000001b8677	insertps	$0x1c, %xmm9, %xmm3             ## xmm3 = xmm3[0],xmm9[0],zero,zero
00000000001b867e	movaps	-0x40(%rbp), %xmm10
00000000001b8683	insertps	$0x28, %xmm10, %xmm3            ## xmm3 = xmm3[0,1],xmm10[0],zero
00000000001b868a	movaps	0x211a3f(%rip), %xmm2
00000000001b8691	movaps	%xmm10, %xmm4
00000000001b8695	xorps	%xmm2, %xmm4
00000000001b8698	movaps	%xmm9, %xmm5
00000000001b869c	movaps	%xmm9, %xmm6
00000000001b86a0	movaps	%xmm11, %xmm7
00000000001b86a4	xorps	%xmm2, %xmm7
00000000001b86a7	xorps	%xmm2, %xmm9
00000000001b86ab	movaps	%xmm11, %xmm8
00000000001b86af	mulss	%xmm0, %xmm4
00000000001b86b3	mulss	%xmm0, %xmm5
00000000001b86b7	mulss	%xmm0, %xmm9
00000000001b86bc	mulss	%xmm0, %xmm11
00000000001b86c1	insertps	$0x1c, %xmm11, %xmm9            ## xmm9 = xmm9[0],xmm11[0],zero,zero
00000000001b86c8	movaps	%xmm0, %xmm2
00000000001b86cb	mulss	%xmm10, %xmm2
00000000001b86d0	mulss	%xmm0, %xmm7
00000000001b86d4	blendps	$0x2, %xmm0, %xmm2              ## xmm2 = xmm2[0],xmm0[1],xmm2[2,3]
00000000001b86da	insertps	$0x68, %xmm0, %xmm9             ## xmm9 = xmm9[0,1],xmm0[1],zero
00000000001b86e1	shufps	$0x55, %xmm0, %xmm0             ## xmm0 = xmm0[1,1,1,1]
00000000001b86e5	mulps	%xmm3, %xmm0
00000000001b86e8	subps	%xmm0, %xmm3
00000000001b86eb	shufps	$0x0, %xmm8, %xmm8              ## xmm8 = xmm8[0,0,0,0]
00000000001b86f0	mulps	%xmm3, %xmm8
00000000001b86f4	insertps	$0x1c, %xmm4, %xmm1             ## xmm1 = xmm1[0],xmm4[0],zero,zero
00000000001b86fa	insertps	$0x28, %xmm5, %xmm1             ## xmm1 = xmm1[0,1],xmm5[0],zero
00000000001b8700	addps	%xmm8, %xmm1
00000000001b8704	shufps	$0x0, %xmm6, %xmm6              ## xmm6 = xmm6[0,0,0,0]
00000000001b8708	mulps	%xmm3, %xmm6
00000000001b870b	insertps	$0x28, %xmm7, %xmm2             ## xmm2 = xmm2[0,1],xmm7[0],zero
00000000001b8711	addps	%xmm6, %xmm2
00000000001b8714	movaps	%xmm10, %xmm0
00000000001b8718	shufps	$0x0, %xmm10, %xmm0             ## xmm0 = xmm0[0,0],xmm10[0,0]
00000000001b871d	mulps	%xmm3, %xmm0
00000000001b8720	addps	%xmm0, %xmm9
00000000001b8724	movaps	0x1b0(%rbx), %xmm6
00000000001b872b	movaps	0x1c0(%rbx), %xmm5
00000000001b8732	movaps	0x1d0(%rbx), %xmm4
00000000001b8739	movaps	0x1e0(%rbx), %xmm0
00000000001b8740	movaps	%xmm6, %xmm3
00000000001b8743	shufps	$0x0, %xmm6, %xmm3              ## xmm3 = xmm3[0,0],xmm6[0,0]
00000000001b8747	mulps	%xmm1, %xmm3
00000000001b874a	movaps	%xmm6, %xmm7
00000000001b874d	shufps	$0x55, %xmm6, %xmm7             ## xmm7 = xmm7[1,1],xmm6[1,1]
00000000001b8751	mulps	%xmm2, %xmm7
00000000001b8754	addps	%xmm3, %xmm7
00000000001b8757	movaps	%xmm6, %xmm8
00000000001b875b	shufps	$0xaa, %xmm6, %xmm8             ## xmm8 = xmm8[2,2],xmm6[2,2]
00000000001b8760	mulps	%xmm9, %xmm8
00000000001b8764	addps	%xmm7, %xmm8
00000000001b8768	shufps	$0xff, %xmm6, %xmm6             ## xmm6 = xmm6[3,3,3,3]
00000000001b876c	movaps	0x21186d(%rip), %xmm3
00000000001b8773	mulps	%xmm3, %xmm6
00000000001b8776	addps	%xmm8, %xmm6
00000000001b877a	movaps	%xmm6, 0x1b0(%rbx)
00000000001b8781	movaps	%xmm5, %xmm6
00000000001b8784	shufps	$0x0, %xmm5, %xmm6              ## xmm6 = xmm6[0,0],xmm5[0,0]
00000000001b8788	mulps	%xmm1, %xmm6
00000000001b878b	movaps	%xmm5, %xmm7
00000000001b878e	shufps	$0x55, %xmm5, %xmm7             ## xmm7 = xmm7[1,1],xmm5[1,1]
00000000001b8792	mulps	%xmm2, %xmm7
00000000001b8795	addps	%xmm6, %xmm7
00000000001b8798	movaps	%xmm5, %xmm6
00000000001b879b	shufps	$0xaa, %xmm5, %xmm6             ## xmm6 = xmm6[2,2],xmm5[2,2]
00000000001b879f	mulps	%xmm9, %xmm6
00000000001b87a3	addps	%xmm7, %xmm6
00000000001b87a6	shufps	$0xff, %xmm5, %xmm5             ## xmm5 = xmm5[3,3,3,3]
00000000001b87aa	mulps	%xmm3, %xmm5
00000000001b87ad	addps	%xmm6, %xmm5
00000000001b87b0	movaps	%xmm5, 0x1c0(%rbx)
00000000001b87b7	movaps	%xmm4, %xmm5
00000000001b87ba	shufps	$0x0, %xmm4, %xmm5              ## xmm5 = xmm5[0,0],xmm4[0,0]
00000000001b87be	mulps	%xmm1, %xmm5
00000000001b87c1	movaps	%xmm4, %xmm6
00000000001b87c4	shufps	$0x55, %xmm4, %xmm6             ## xmm6 = xmm6[1,1],xmm4[1,1]
00000000001b87c8	mulps	%xmm2, %xmm6
00000000001b87cb	addps	%xmm5, %xmm6
00000000001b87ce	movaps	%xmm4, %xmm5
00000000001b87d1	shufps	$0xaa, %xmm4, %xmm5             ## xmm5 = xmm5[2,2],xmm4[2,2]
00000000001b87d5	mulps	%xmm9, %xmm5
00000000001b87d9	addps	%xmm6, %xmm5
00000000001b87dc	shufps	$0xff, %xmm4, %xmm4             ## xmm4 = xmm4[3,3,3,3]
00000000001b87e0	mulps	%xmm3, %xmm4
00000000001b87e3	addps	%xmm5, %xmm4
00000000001b87e6	movaps	%xmm4, 0x1d0(%rbx)
00000000001b87ed	movaps	%xmm0, %xmm4
00000000001b87f0	shufps	$0x0, %xmm0, %xmm4              ## xmm4 = xmm4[0,0],xmm0[0,0]
00000000001b87f4	mulps	%xmm1, %xmm4
00000000001b87f7	movaps	%xmm0, %xmm1
00000000001b87fa	shufps	$0x55, %xmm0, %xmm1             ## xmm1 = xmm1[1,1],xmm0[1,1]
00000000001b87fe	mulps	%xmm2, %xmm1
00000000001b8801	addps	%xmm4, %xmm1
00000000001b8804	movaps	%xmm0, %xmm2
00000000001b8807	shufps	$0xaa, %xmm0, %xmm2             ## xmm2 = xmm2[2,2],xmm0[2,2]
00000000001b880b	mulps	%xmm9, %xmm2
00000000001b880f	addps	%xmm1, %xmm2
00000000001b8812	shufps	$0xff, %xmm0, %xmm0             ## xmm0 = xmm0[3,3,3,3]
00000000001b8816	mulps	%xmm3, %xmm0
00000000001b8819	addps	%xmm2, %xmm0
00000000001b881c	movaps	%xmm0, 0x1e0(%rbx)
00000000001b8823	addq	$0x38, %rsp
00000000001b8827	popq	%rbx
00000000001b8828	popq	%rbp
00000000001b8829	retq
00000000001b882a	nopw	(%rax,%rax)
