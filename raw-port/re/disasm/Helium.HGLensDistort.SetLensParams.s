__ZN13HGLensDistort13SetLensParamsEfffffff:
0000000000229e70	pushq	%rbp
0000000000229e71	movq	%rsp, %rbp
0000000000229e74	pushq	%rbx
0000000000229e75	subq	$0xa8, %rsp
0000000000229e7c	movaps	0x19ddac(%rip), %xmm8
0000000000229e84	andps	%xmm6, %xmm8
0000000000229e88	movss	0x1a3200(%rip), %xmm7
0000000000229e90	ucomiss	%xmm8, %xmm7
0000000000229e94	jbe	0x229ea6
0000000000229e96	movq	$0x0, 0x1a8(%rdi)
0000000000229ea1	jmp	0x22a0a9
0000000000229ea6	xorps	%xmm7, %xmm7
0000000000229ea9	xorl	%eax, %eax
0000000000229eab	ucomiss	%xmm7, %xmm6
0000000000229eae	setbe	%al
0000000000229eb1	movq	0x198(%rdi,%rax,8), %rax
0000000000229eb9	movq	%rax, 0x1a8(%rdi)
0000000000229ec0	testq	%rax, %rax
0000000000229ec3	je	0x22a0a9
0000000000229ec9	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
0000000000229ed0	leaq	__ZTI20HGLensDistort_kernel(%rip), %rdx ## typeinfo for HGLensDistort_kernel
0000000000229ed7	movq	%rax, %rdi
0000000000229eda	xorl	%ecx, %ecx
0000000000229edc	movss	%xmm3, -0x14(%rbp)
0000000000229ee1	movss	%xmm2, -0x10(%rbp)
0000000000229ee6	movaps	%xmm0, -0xb0(%rbp)
0000000000229eed	movaps	%xmm8, -0x30(%rbp)
0000000000229ef2	movaps	%xmm1, -0xa0(%rbp)
0000000000229ef9	movaps	%xmm6, -0x60(%rbp)
0000000000229efd	movaps	%xmm5, -0x50(%rbp)
0000000000229f01	movaps	%xmm4, -0x40(%rbp)
0000000000229f05	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000229f0a	movaps	-0x40(%rbp), %xmm3
0000000000229f0e	movaps	-0x50(%rbp), %xmm0
0000000000229f12	movaps	-0x60(%rbp), %xmm2
0000000000229f16	movaps	-0x30(%rbp), %xmm1
0000000000229f1a	testq	%rax, %rax
0000000000229f1d	je	0x22a0a9
0000000000229f23	movq	%rax, %rbx
0000000000229f26	movaps	%xmm3, %xmm4
0000000000229f29	insertps	$0x10, %xmm0, %xmm4             ## xmm4 = xmm4[0],xmm0[0],xmm4[2,3]
0000000000229f2f	xorps	%xmm0, %xmm0
0000000000229f32	cvtss2sd	%xmm1, %xmm0
0000000000229f36	ucomisd	0x1a84ba(%rip), %xmm0
0000000000229f3e	xorps	%xmm3, %xmm3
0000000000229f41	jbe	0x229f56
0000000000229f43	xorps	%xmm0, %xmm0
0000000000229f46	cmpless	%xmm2, %xmm0
0000000000229f4b	movss	0x1a8435(%rip), %xmm1
0000000000229f53	andps	%xmm0, %xmm1
0000000000229f56	movaps	0x19dcd3(%rip), %xmm0
0000000000229f5d	andps	%xmm4, %xmm0
0000000000229f60	movaps	%xmm0, -0x90(%rbp)
0000000000229f67	ucomiss	%xmm3, %xmm1
0000000000229f6a	jne	0x229f6e
0000000000229f6c	jnp	0x229f7a
0000000000229f6e	movss	0x19dd4a(%rip), %xmm3
0000000000229f76	divss	%xmm1, %xmm3
0000000000229f7a	movss	%xmm3, -0xc(%rbp)
0000000000229f7f	xorps	%xmm0, %xmm0
0000000000229f82	cmpleps	%xmm4, %xmm0
0000000000229f86	movaps	%xmm0, -0x80(%rbp)
0000000000229f8a	xorps	%xmm0, %xmm0
0000000000229f8d	cvtss2sd	%xmm1, %xmm0
0000000000229f91	mulsd	0x1a2227(%rip), %xmm0
0000000000229f99	movaps	%xmm1, -0x30(%rbp)
0000000000229f9d	movaps	%xmm4, -0x70(%rbp)
0000000000229fa1	callq	0x3c5642                        ## symbol stub for: _tan
0000000000229fa6	addsd	%xmm0, %xmm0
0000000000229faa	xorps	%xmm1, %xmm1
0000000000229fad	cvtsd2ss	%xmm0, %xmm1
0000000000229fb1	movss	0x19dd07(%rip), %xmm2
0000000000229fb9	divss	%xmm1, %xmm2
0000000000229fbd	movaps	-0xb0(%rbp), %xmm5
0000000000229fc4	movss	%xmm5, 0x1a8(%rbx)
0000000000229fcc	movaps	-0xa0(%rbp), %xmm6
0000000000229fd3	movss	%xmm6, 0x1ac(%rbx)
0000000000229fdb	movss	-0x10(%rbp), %xmm4
0000000000229fe0	movss	%xmm4, 0x1b0(%rbx)
0000000000229fe8	movss	-0x14(%rbp), %xmm3
0000000000229fed	movss	%xmm3, 0x1b4(%rbx)
0000000000229ff5	movaps	-0x40(%rbp), %xmm0
0000000000229ff9	movss	%xmm0, 0x1b8(%rbx)
000000000022a001	movaps	-0x50(%rbp), %xmm0
000000000022a005	movss	%xmm0, 0x1bc(%rbx)
000000000022a00d	movaps	-0x60(%rbp), %xmm0
000000000022a011	movss	%xmm0, 0x1c0(%rbx)
000000000022a019	movaps	0x1ae9b0(%rip), %xmm7
000000000022a020	movaps	-0x90(%rbp), %xmm0
000000000022a027	cmpltps	%xmm7, %xmm0
000000000022a02b	movaps	-0x80(%rbp), %xmm8
000000000022a030	andps	%xmm7, %xmm8
000000000022a034	movaps	-0x70(%rbp), %xmm7
000000000022a038	blendvps	%xmm0, %xmm8, %xmm7
000000000022a03e	insertps	$0x10, %xmm6, %xmm5             ## xmm5 = xmm5[0],xmm6[0],xmm5[2,3]
000000000022a044	divps	%xmm7, %xmm5
000000000022a047	movaps	0x1a0062(%rip), %xmm0
000000000022a04e	divps	%xmm5, %xmm0
000000000022a051	movlhps	%xmm0, %xmm5                    ## xmm5 = xmm5[0],xmm0[0]
000000000022a054	movups	%xmm5, 0x1c4(%rbx)
000000000022a05b	movss	%xmm4, 0x1d4(%rbx)
000000000022a063	movss	%xmm3, 0x1d8(%rbx)
000000000022a06b	movaps	-0x30(%rbp), %xmm0
000000000022a06f	movss	%xmm0, 0x1dc(%rbx)
000000000022a077	movss	-0xc(%rbp), %xmm0
000000000022a07c	movss	%xmm0, 0x1e0(%rbx)
000000000022a084	movss	%xmm1, 0x1e4(%rbx)
000000000022a08c	movss	%xmm2, 0x1e8(%rbx)
000000000022a094	movq	(%rbx), %rax
000000000022a097	movq	%rbx, %rdi
000000000022a09a	addq	$0xa8, %rsp
000000000022a0a1	popq	%rbx
000000000022a0a2	popq	%rbp
000000000022a0a3	jmpq	*0x240(%rax)
000000000022a0a9	addq	$0xa8, %rsp
000000000022a0b0	popq	%rbx
000000000022a0b1	popq	%rbp
000000000022a0b2	retq
000000000022a0b3	nopw	%cs:(%rax,%rax)
