__ZN17HGDefaultPolicies22getStudioPaddingPolicyEyb:
0000000000051be0	pushq	%rbp
0000000000051be1	movq	%rsp, %rbp
0000000000051be4	pushq	%r14
0000000000051be6	pushq	%rbx
0000000000051be7	movq	%rdi, %r14
0000000000051bea	testl	%edx, %edx
0000000000051bec	je	0x51c87
0000000000051bf2	movl	$0x38, %edi
0000000000051bf7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000051bfc	movq	%rax, %rbx
0000000000051bff	movq	%rax, %rdi
0000000000051c02	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000051c07	leaq	0x9b5bea(%rip), %rax
0000000000051c0e	movq	%rax, (%rbx)
0000000000051c11	movq	%rbx, %rax
0000000000051c14	addq	$0x10, %rax
0000000000051c18	movq	%rax, 0x10(%rbx)
0000000000051c1c	movq	%rax, 0x18(%rbx)
0000000000051c20	movq	$0x0, 0x20(%rbx)
0000000000051c28	movabsq	$0x100000002, %rax              ## imm = 0x100000002
0000000000051c32	movq	%rax, 0x28(%rbx)
0000000000051c36	movl	$0x4, 0x30(%rbx)
0000000000051c3d	leaq	__ZN15HG_RENDERER_ENV23TEX_PADDING_REMEMBRANCEE(%rip), %rax ## HG_RENDERER_ENV::TEX_PADDING_REMEMBRANCE
0000000000051c44	movl	(%rax), %eax
0000000000051c46	cmpl	$-0x1, %eax
0000000000051c49	je	0x51c4e
0000000000051c4b	movl	%eax, 0x28(%rbx)
0000000000051c4e	leaq	__ZN15HG_RENDERER_ENV22TEX_PADDING_CUSHIONINGE(%rip), %rax ## HG_RENDERER_ENV::TEX_PADDING_CUSHIONING
0000000000051c55	movl	(%rax), %eax
0000000000051c57	cmpl	$-0x1, %eax
0000000000051c5a	je	0x51c5f
0000000000051c5c	movl	%eax, 0x2c(%rbx)
0000000000051c5f	leaq	__ZN15HG_RENDERER_ENV20TEX_PADDING_CLUMPINGE(%rip), %rax ## HG_RENDERER_ENV::TEX_PADDING_CLUMPING
0000000000051c66	movl	(%rax), %eax
0000000000051c68	cmpl	$-0x1, %eax
0000000000051c6b	je	0x51c70
0000000000051c6d	movl	%eax, 0x30(%rbx)
0000000000051c70	movabsq	$0x400000020, %rax              ## imm = 0x400000020
0000000000051c7a	movq	%rax, 0x28(%rbx)
0000000000051c7e	movl	$0x20, 0x30(%rbx)
0000000000051c85	jmp	0x51ca6
0000000000051c87	movl	$0x10, %edi
0000000000051c8c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000051c91	movq	%rax, %rbx
0000000000051c94	movq	%rax, %rdi
0000000000051c97	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000051c9c	leaq	0x9b5a05(%rip), %rax
0000000000051ca3	movq	%rax, (%rbx)
0000000000051ca6	movq	%rbx, (%r14)
0000000000051ca9	movq	%r14, %rax
0000000000051cac	popq	%rbx
0000000000051cad	popq	%r14
0000000000051caf	popq	%rbp
0000000000051cb0	retq
0000000000051cb1	jmp	0x51cb3
0000000000051cb3	movq	%rax, %r14
0000000000051cb6	movq	%rbx, %rdi
0000000000051cb9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000051cbe	movq	%r14, %rdi
0000000000051cc1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000051cc6	nopw	%cs:(%rax,%rax)
