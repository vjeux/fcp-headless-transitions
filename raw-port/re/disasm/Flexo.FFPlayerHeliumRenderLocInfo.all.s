__ZN27FFPlayerHeliumRenderLocInfoC1Eb:
0000000000d73b00	pushq	%rbp
0000000000d73b01	movq	%rsp, %rbp
0000000000d73b04	pushq	%r14
0000000000d73b06	pushq	%rbx
0000000000d73b07	movl	%esi, %ebx
0000000000d73b09	movq	%rdi, %r14
0000000000d73b0c	callq	_FFImageLocationSetCPUOnly
0000000000d73b11	movq	%rax, (%r14)
0000000000d73b14	movl	$0x0, 0x8(%r14)
0000000000d73b1c	movq	$0x0, 0x10(%r14)
0000000000d73b24	xorb	$0x1, %bl
0000000000d73b27	movzbl	%bl, %eax
0000000000d73b2a	leal	(%rax,%rax,2), %eax
0000000000d73b2d	addl	$0x3, %eax
0000000000d73b30	movl	%eax, 0x18(%r14)
0000000000d73b34	movl	$0x0, 0x20(%r14)
0000000000d73b3c	popq	%rbx
0000000000d73b3d	popq	%r14
0000000000d73b3f	popq	%rbp
0000000000d73b40	retq
0000000000d73b41	nopw	%cs:(%rax,%rax)
__ZN27FFPlayerHeliumRenderLocInfoC2EPK11FxDeviceSet32FFPlayerHeliumLocationPreferencePK8FxDevice16FFSVPriorityEnumii6CMTime:
0000000000d73b50	pushq	%rbp
0000000000d73b51	movq	%rsp, %rbp
0000000000d73b54	movl	0x10(%rbp), %eax
0000000000d73b57	movq	%rsi, (%rdi)
0000000000d73b5a	movl	%edx, 0x8(%rdi)
0000000000d73b5d	movq	%rcx, 0x10(%rdi)
0000000000d73b61	movl	%r8d, 0x18(%rdi)
0000000000d73b65	movl	%r9d, 0x1c(%rdi)
0000000000d73b69	movl	%eax, 0x20(%rdi)
0000000000d73b6c	movups	0x18(%rbp), %xmm0
0000000000d73b70	movups	%xmm0, 0x24(%rdi)
0000000000d73b74	movq	0x28(%rbp), %rax
0000000000d73b78	movq	%rax, 0x34(%rdi)
0000000000d73b7c	popq	%rbp
0000000000d73b7d	retq
0000000000d73b7e	nop
__ZN27FFPlayerHeliumRenderLocInfo25getPreferredImageLocationEP7NSArrayIP11FFDestVideoE:
0000000000d73b80	pushq	%rbp
0000000000d73b81	movq	%rsp, %rbp
0000000000d73b84	pushq	%r15
0000000000d73b86	pushq	%r14
0000000000d73b88	pushq	%r13
0000000000d73b8a	pushq	%r12
0000000000d73b8c	pushq	%rbx
0000000000d73b8d	subq	$0xe8, %rsp
0000000000d73b94	movq	%rsi, %rbx
0000000000d73b97	movq	%rdi, %r14
0000000000d73b9a	movq	0xb7a027(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000d73ba1	movq	(%rax), %rax
0000000000d73ba4	movq	%rax, -0x30(%rbp)
0000000000d73ba8	movq	(%rdi), %rdi
0000000000d73bab	callq	_FFImageLocationSetCountAllDeviceTypes
0000000000d73bb0	cmpl	$0x2, %eax
0000000000d73bb3	jl	0xd73d9f
0000000000d73bb9	movl	0x8(%r14), %eax
0000000000d73bbd	cmpl	$0x1, %eax
0000000000d73bc0	je	0xd73bda
0000000000d73bc2	testl	%eax, %eax
0000000000d73bc4	jne	0xd73d9f
0000000000d73bca	movq	0x10(%r14), %rax
0000000000d73bce	movq	%rax, -0xb8(%rbp)
0000000000d73bd5	jmp	0xd73daa
0000000000d73bda	xorps	%xmm0, %xmm0
0000000000d73bdd	movaps	%xmm0, -0xe0(%rbp)
0000000000d73be4	movaps	%xmm0, -0xf0(%rbp)
0000000000d73beb	movaps	%xmm0, -0x100(%rbp)
0000000000d73bf2	movaps	%xmm0, -0x110(%rbp)
0000000000d73bf9	movq	0xe448f0(%rip), %rsi
0000000000d73c00	leaq	-0x110(%rbp), %rdx
0000000000d73c07	leaq	-0xb0(%rbp), %rcx
0000000000d73c0e	movl	$0x10, %r8d
0000000000d73c14	movq	%rbx, %rdi
0000000000d73c17	callq	*0xb79aa3(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73c1d	movq	%rax, -0xc8(%rbp)
0000000000d73c24	testq	%rax, %rax
0000000000d73c27	je	0xd73d9f
0000000000d73c2d	movq	-0x100(%rbp), %rax
0000000000d73c34	movq	(%rax), %rax
0000000000d73c37	movq	%rax, -0xd0(%rbp)
0000000000d73c3e	movq	$0x0, -0xb8(%rbp)
0000000000d73c49	movq	%rbx, -0xc0(%rbp)
0000000000d73c50	jmp	0xd73c94
0000000000d73c52	nopw	%cs:(%rax,%rax)
0000000000d73c60	movl	$0x10, %r8d
0000000000d73c66	movq	%rbx, %rdi
0000000000d73c69	movq	0xe44880(%rip), %rsi
0000000000d73c70	leaq	-0x110(%rbp), %rdx
0000000000d73c77	leaq	-0xb0(%rbp), %rcx
0000000000d73c7e	callq	*0xb79a3c(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73c84	movq	%rax, -0xc8(%rbp)
0000000000d73c8b	testq	%rax, %rax
0000000000d73c8e	je	0xd73daa
0000000000d73c94	movq	0xe63ba5(%rip), %r13
0000000000d73c9b	movq	0xe7d96e(%rip), %r15
0000000000d73ca2	xorl	%r12d, %r12d
0000000000d73ca5	jmp	0xd73cbc
0000000000d73ca7	movq	-0xc0(%rbp), %rbx
0000000000d73cae	nop
0000000000d73cb0	incq	%r12
0000000000d73cb3	cmpq	%r12, -0xc8(%rbp)
0000000000d73cba	je	0xd73c60
0000000000d73cbc	movq	-0x100(%rbp), %rax
0000000000d73cc3	movq	-0xd0(%rbp), %rcx
0000000000d73cca	cmpq	%rcx, (%rax)
0000000000d73ccd	je	0xd73cd7
0000000000d73ccf	movq	%rbx, %rdi
0000000000d73cd2	callq	0x149793e                       ## symbol stub for: _objc_enumerationMutation
0000000000d73cd7	movq	-0x108(%rbp), %rax
0000000000d73cde	movq	(%rax,%r12,8), %rdi
0000000000d73ce2	movq	%r13, %rsi
0000000000d73ce5	movq	0xb799d4(%rip), %r14            ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73cec	callq	*%r14
0000000000d73cef	movq	%rax, %rdi
0000000000d73cf2	movq	%r15, %rsi
0000000000d73cf5	callq	*%r14
0000000000d73cf8	movq	%rax, %r14
0000000000d73cfb	movq	%rax, %rdi
0000000000d73cfe	callq	_FFImageLocationSetIsEmpty
0000000000d73d03	testb	%al, %al
0000000000d73d05	jne	0xd73cb0
0000000000d73d07	movq	%r14, %rdi
0000000000d73d0a	callq	_FFImageLocationSetIsSingleEntry
0000000000d73d0f	testb	%al, %al
0000000000d73d11	je	0xd73cb0
0000000000d73d13	movq	%r14, %rdi
0000000000d73d16	callq	_FFImageLocationSetIsSingleEntry
0000000000d73d1b	testb	%al, %al
0000000000d73d1d	je	0xd73cb0
0000000000d73d1f	movq	%r14, %rdi
0000000000d73d22	callq	_FFImageLocationSetGetSingleLocation
0000000000d73d27	movq	%rax, %rbx
0000000000d73d2a	movq	%rax, %rdi
0000000000d73d2d	callq	_FFImageLocationIsAbsoluteGPU
0000000000d73d32	testb	%al, %al
0000000000d73d34	jne	0xd73d46
0000000000d73d36	movq	%rbx, %rdi
0000000000d73d39	callq	_FFImageLocationMustBeRAM
0000000000d73d3e	testb	%al, %al
0000000000d73d40	je	0xd73ca7
0000000000d73d46	movq	%r14, %rdi
0000000000d73d49	callq	_FFImageLocationSetGetSingleLocation
0000000000d73d4e	movq	%rax, %r14
0000000000d73d51	movq	-0xb8(%rbp), %rbx
0000000000d73d58	movq	%rbx, %rdi
0000000000d73d5b	callq	_FFImageLocationIsAbsoluteGPU
0000000000d73d60	testb	%al, %al
0000000000d73d62	je	0xd73d68
0000000000d73d64	xorl	%eax, %eax
0000000000d73d66	jmp	0xd73d72
0000000000d73d68	movq	%rbx, %rdi
0000000000d73d6b	callq	_FFImageLocationMustBeRAM
0000000000d73d70	xorb	$0x1, %al
0000000000d73d72	cmpq	%rbx, %r14
0000000000d73d75	sete	%cl
0000000000d73d78	orb	%al, %cl
0000000000d73d7a	movq	%rbx, %rdi
0000000000d73d7d	movq	-0xc0(%rbp), %rbx
0000000000d73d84	je	0xd73d92
0000000000d73d86	movq	%r14, -0xb8(%rbp)
0000000000d73d8d	jmp	0xd73cb0
0000000000d73d92	callq	_FFStringFromImageLocation
0000000000d73d97	movq	%r14, %rdi
0000000000d73d9a	callq	_FFStringFromImageLocation
0000000000d73d9f	movq	$0x0, -0xb8(%rbp)
0000000000d73daa	movq	0xb79e17(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000d73db1	movq	(%rax), %rax
0000000000d73db4	cmpq	-0x30(%rbp), %rax
0000000000d73db8	jne	0xd73dd3
0000000000d73dba	movq	-0xb8(%rbp), %rax
0000000000d73dc1	addq	$0xe8, %rsp
0000000000d73dc8	popq	%rbx
0000000000d73dc9	popq	%r12
0000000000d73dcb	popq	%r13
0000000000d73dcd	popq	%r14
0000000000d73dcf	popq	%r15
0000000000d73dd1	popq	%rbp
