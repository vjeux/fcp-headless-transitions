__ZN24FFStreamSharedHGNodeInfo10setOrigImgEP7FFImage6CMTimeS2_P11FFSVContext:
0000000000fa3ab0	pushq	%rbp
0000000000fa3ab1	movq	%rsp, %rbp
0000000000fa3ab4	pushq	%r15
0000000000fa3ab6	pushq	%r14
0000000000fa3ab8	pushq	%r12
0000000000fa3aba	pushq	%rbx
0000000000fa3abb	subq	$0x10, %rsp
0000000000fa3abf	movq	%rdx, %r12
0000000000fa3ac2	movq	%rsi, %r15
0000000000fa3ac5	movq	%rdi, %rbx
0000000000fa3ac8	movl	$0x58, %edi
0000000000fa3acd	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000fa3ad2	movq	%rax, %r14
0000000000fa3ad5	movaps	0x10(%rbp), %xmm0
0000000000fa3ad9	movups	%xmm0, (%rax)
0000000000fa3adc	movq	0x20(%rbp), %rax
0000000000fa3ae0	movq	%rax, 0x10(%r14)
0000000000fa3ae4	movups	0x28(%rbp), %xmm0
0000000000fa3ae8	movups	%xmm0, 0x18(%r14)
0000000000fa3aed	movq	0x38(%rbp), %rax
0000000000fa3af1	movq	%rax, 0x28(%r14)
0000000000fa3af5	movq	$0x0, 0x50(%r14)
0000000000fa3afd	movq	%r12, %rdi
0000000000fa3b00	callq	*0x949c0a(%rip)                 ## literal pool symbol address: _objc_retain
0000000000fa3b06	movq	%rax, 0x30(%r14)
0000000000fa3b0a	movq	%r15, %rdi
0000000000fa3b0d	callq	*0x949bfd(%rip)                 ## literal pool symbol address: _objc_retain
0000000000fa3b13	movq	%rax, 0x50(%r14)
0000000000fa3b17	movq	$0x0, -0x30(%rbp)
0000000000fa3b1f	movq	$0x0, -0x28(%rbp)
0000000000fa3b27	movq	0xc2d8ba(%rip), %rsi
0000000000fa3b2e	leaq	-0x30(%rbp), %rdx
0000000000fa3b32	leaq	-0x28(%rbp), %rcx
0000000000fa3b36	movq	%rax, %rdi
0000000000fa3b39	callq	*0x949b81(%rip)                 ## Objc message: -[%rdi arranged]
0000000000fa3b3f	movq	%rax, 0x38(%r14)
0000000000fa3b43	movq	-0x30(%rbp), %rdi
0000000000fa3b47	callq	*0x949bc3(%rip)                 ## literal pool symbol address: _objc_retain
0000000000fa3b4d	movq	%rax, 0x40(%r14)
0000000000fa3b51	movq	-0x28(%rbp), %rdi
0000000000fa3b55	callq	0x1494ad6                       ## symbol stub for: _CGColorSpaceRetain
0000000000fa3b5a	movq	%rax, 0x48(%r14)
0000000000fa3b5e	leaq	0x8(%rbx), %r15
0000000000fa3b62	movl	$0x18, %edi
0000000000fa3b67	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000fa3b6c	movq	%r14, 0x10(%rax)
0000000000fa3b70	movq	%r15, 0x8(%rax)
0000000000fa3b74	movq	0x8(%rbx), %rcx
0000000000fa3b78	movq	%rcx, (%rax)
0000000000fa3b7b	movq	%rax, 0x8(%rcx)
0000000000fa3b7f	movq	%rax, 0x8(%rbx)
0000000000fa3b83	incq	0x18(%rbx)
0000000000fa3b87	addq	$0x10, %rsp
0000000000fa3b8b	popq	%rbx
0000000000fa3b8c	popq	%r12
0000000000fa3b8e	popq	%r14
0000000000fa3b90	popq	%r15
0000000000fa3b92	popq	%rbp
0000000000fa3b93	retq
0000000000fa3b94	movq	%rax, %rbx
0000000000fa3b97	movq	%r14, %rdi
0000000000fa3b9a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000fa3b9f	movq	%rbx, %rdi
0000000000fa3ba2	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000fa3ba7	nopw	(%rax,%rax)
