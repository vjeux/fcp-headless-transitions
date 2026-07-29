__ZN13HGColorMatrixC1Ev:
0000000000246b30	pushq	%rbp
0000000000246b31	movq	%rsp, %rbp
0000000000246b34	pushq	%r14
0000000000246b36	pushq	%rbx
0000000000246b37	movq	%rdi, %rbx
0000000000246b3a	callq	__ZN8HGNode3DC2Ev               ## HGNode3D::HGNode3D()
0000000000246b3f	leaq	0x7efaea(%rip), %rax
0000000000246b46	movq	%rax, (%rbx)
0000000000246b49	movl	$0xa7, %edi
0000000000246b4e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000246b53	leaq	0x8(%rax), %rcx
0000000000246b57	negl	%ecx
0000000000246b59	andl	$0x1f, %ecx
0000000000246b5c	leaq	(%rcx,%rax), %rdx
0000000000246b60	addq	$0x8, %rdx
0000000000246b64	movq	%rax, (%rcx,%rax)
0000000000246b68	xorps	%xmm0, %xmm0
0000000000246b6b	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000246b70	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000246b75	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000246b7a	movaps	%xmm0, 0x38(%rcx,%rax)
0000000000246b7f	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000246b84	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000246b89	movaps	%xmm0, 0x68(%rcx,%rax)
0000000000246b8e	movaps	%xmm0, 0x78(%rcx,%rax)
0000000000246b93	movq	%rdx, 0x1a0(%rbx)
0000000000246b9a	movl	$0xd4256485, 0xc(%rbx)          ## imm = 0xD4256485
0000000000246ba1	movq	$0x0, 0x198(%rbx)
0000000000246bac	movss	0x18110c(%rip), %xmm0
0000000000246bb4	movaps	%xmm0, 0x1b0(%rbx)
0000000000246bbb	movsd	0x1810ed(%rip), %xmm0
0000000000246bc3	movaps	%xmm0, 0x1c0(%rbx)
0000000000246bca	movaps	0x183e9f(%rip), %xmm0
0000000000246bd1	movaps	%xmm0, 0x1d0(%rbx)
0000000000246bd8	movaps	0x183401(%rip), %xmm0
0000000000246bdf	movaps	%xmm0, 0x1e0(%rbx)
0000000000246be6	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
0000000000246beb	andl	0x10(%rbx), %eax
0000000000246bee	orl	$0x400, %eax                    ## imm = 0x400
0000000000246bf3	movl	%eax, 0x10(%rbx)
0000000000246bf6	popq	%rbx
0000000000246bf7	popq	%r14
0000000000246bf9	popq	%rbp
0000000000246bfa	retq
0000000000246bfb	movq	%rax, %r14
0000000000246bfe	movq	%rbx, %rdi
0000000000246c01	callq	__ZN8HGNode3DD2Ev               ## HGNode3D::~HGNode3D()
0000000000246c06	movq	%r14, %rdi
0000000000246c09	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000246c0e	nop
