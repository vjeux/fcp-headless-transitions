__ZN24FFStreamSharedHGNodeInfo14newSharedImageE6CMTimeS0_P11FFSVContext:
0000000000fa3990	pushq	%rbp
0000000000fa3991	movq	%rsp, %rbp
0000000000fa3994	pushq	%r15
0000000000fa3996	pushq	%r14
0000000000fa3998	pushq	%r13
0000000000fa399a	pushq	%r12
0000000000fa399c	pushq	%rbx
0000000000fa399d	subq	$0x48, %rsp
0000000000fa39a1	movq	%rsi, -0x38(%rbp)
0000000000fa39a5	movq	%rdi, %r14
0000000000fa39a8	movq	0x10(%rdi), %r12
0000000000fa39ac	addq	$0x8, %r14
0000000000fa39b0	cmpq	%r14, %r12
0000000000fa39b3	je	0xfa3a95
0000000000fa39b9	leaq	0x28(%rbp), %r13
0000000000fa39bd	leaq	0x10(%rbp), %rbx
0000000000fa39c1	movq	0xc14d98(%rip), %rax
0000000000fa39c8	movq	%rax, -0x30(%rbp)
0000000000fa39cc	jmp	0xfa39de
0000000000fa39ce	nop
0000000000fa39d0	movq	0x8(%r12), %r12
0000000000fa39d5	cmpq	%r14, %r12
0000000000fa39d8	je	0xfa3a95
0000000000fa39de	movq	0x10(%r12), %r15
0000000000fa39e3	movq	0x10(%rbx), %rax
0000000000fa39e7	movq	%rax, 0x28(%rsp)
0000000000fa39ec	movups	(%rbx), %xmm0
0000000000fa39ef	movups	%xmm0, 0x18(%rsp)
0000000000fa39f4	movq	0x10(%r15), %rax
0000000000fa39f8	movq	%rax, 0x10(%rsp)
0000000000fa39fd	movups	(%r15), %xmm0
0000000000fa3a01	movups	%xmm0, (%rsp)
0000000000fa3a05	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000fa3a0a	testl	%eax, %eax
0000000000fa3a0c	jne	0xfa39d0
0000000000fa3a0e	movq	0x10(%r13), %rax
0000000000fa3a12	movq	%rax, 0x28(%rsp)
0000000000fa3a17	movups	(%r13), %xmm0
0000000000fa3a1c	movups	%xmm0, 0x18(%rsp)
0000000000fa3a21	movq	0x28(%r15), %rax
0000000000fa3a25	movq	%rax, 0x10(%rsp)
0000000000fa3a2a	movups	0x18(%r15), %xmm0
0000000000fa3a2f	movups	%xmm0, (%rsp)
0000000000fa3a33	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000fa3a38	testl	%eax, %eax
0000000000fa3a3a	jne	0xfa39d0
0000000000fa3a3c	movq	0x30(%r15), %rdx
0000000000fa3a40	movq	-0x38(%rbp), %rdi
0000000000fa3a44	movq	-0x30(%rbp), %rsi
0000000000fa3a48	callq	*0x949c72(%rip)                 ## Objc message: -[%rdi arranged]
0000000000fa3a4e	testb	%al, %al
0000000000fa3a50	je	0xfa39d0
0000000000fa3a56	movq	0x10(%r12), %rbx
0000000000fa3a5b	leaq	_OBJC_CLASS_$_FFImage(%rip), %rdi
0000000000fa3a62	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000fa3a67	movq	0x48(%rbx), %rcx
0000000000fa3a6b	movq	0x38(%rbx), %rdx
0000000000fa3a6f	movq	0x40(%rbx), %r8
0000000000fa3a73	movq	0x50(%rbx), %r9
0000000000fa3a77	movq	0xc2e08a(%rip), %rsi
0000000000fa3a7e	movq	%rax, %rdi
0000000000fa3a81	addq	$0x48, %rsp
0000000000fa3a85	popq	%rbx
0000000000fa3a86	popq	%r12
0000000000fa3a88	popq	%r13
0000000000fa3a8a	popq	%r14
0000000000fa3a8c	popq	%r15
0000000000fa3a8e	popq	%rbp
0000000000fa3a8f	jmpq	*0x949c2b(%rip)                 ## Objc message: -[%rdi arranged]
0000000000fa3a95	xorl	%eax, %eax
0000000000fa3a97	addq	$0x48, %rsp
0000000000fa3a9b	popq	%rbx
0000000000fa3a9c	popq	%r12
0000000000fa3a9e	popq	%r13
0000000000fa3aa0	popq	%r14
0000000000fa3aa2	popq	%r15
0000000000fa3aa4	popq	%rbp
0000000000fa3aa5	retq
0000000000fa3aa6	nopw	%cs:(%rax,%rax)
