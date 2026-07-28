__ZN20HgcAVAMotionDilation11BindTextureEP9HGHandleri:
0000000000215c30	pushq	%rbp
0000000000215c31	movq	%rsp, %rbp
0000000000215c34	pushq	%r14
0000000000215c36	pushq	%rbx
0000000000215c37	movq	%rsi, %rbx
0000000000215c3a	cmpl	$0x2, %edx
0000000000215c3d	je	0x215dc7
0000000000215c43	cmpl	$0x1, %edx
0000000000215c46	je	0x215d02
0000000000215c4c	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000000215c52	testl	%edx, %edx
0000000000215c54	jne	0x215e70
0000000000215c5a	movq	(%rbx), %rax
0000000000215c5d	movq	%rbx, %rdi
0000000000215c60	xorl	%esi, %esi
0000000000215c62	xorl	%edx, %edx
0000000000215c64	callq	*0x48(%rax)
0000000000215c67	movq	(%rbx), %rax
0000000000215c6a	movq	%rbx, %rdi
0000000000215c6d	xorl	%esi, %esi
0000000000215c6f	xorl	%edx, %edx
0000000000215c71	callq	*0x30(%rax)
0000000000215c74	movq	%rbx, %rdi
0000000000215c77	xorl	%esi, %esi
0000000000215c79	xorl	%edx, %edx
0000000000215c7b	xorl	%ecx, %ecx
0000000000215c7d	xorl	%r8d, %r8d
0000000000215c80	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215c85	movq	0x90(%rbx), %rdi
0000000000215c8c	movq	(%rdi), %rax
0000000000215c8f	movl	$0x2e, %esi
0000000000215c94	callq	*0x80(%rax)
0000000000215c9a	testl	%eax, %eax
0000000000215c9c	jne	0x215caa
0000000000215c9e	movq	(%rbx), %rax
0000000000215ca1	movq	%rbx, %rdi
0000000000215ca4	callq	*0xa8(%rax)
0000000000215caa	xorl	%r14d, %r14d
0000000000215cad	movq	%rbx, %rdi
0000000000215cb0	movl	$0x3, %esi
0000000000215cb5	xorl	%edx, %edx
0000000000215cb7	xorl	%ecx, %ecx
0000000000215cb9	xorl	%r8d, %r8d
0000000000215cbc	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215cc1	movq	0x90(%rbx), %rdi
0000000000215cc8	movq	(%rdi), %rax
0000000000215ccb	movl	$0x2e, %esi
0000000000215cd0	callq	*0x80(%rax)
0000000000215cd6	testl	%eax, %eax
0000000000215cd8	jne	0x215ce6
0000000000215cda	movq	(%rbx), %rax
0000000000215cdd	movq	%rbx, %rdi
0000000000215ce0	callq	*0xa8(%rax)
0000000000215ce6	movq	(%rbx), %rax
0000000000215ce9	movsd	0x1b456f(%rip), %xmm0
0000000000215cf1	xorps	%xmm1, %xmm1
0000000000215cf4	xorps	%xmm2, %xmm2
0000000000215cf7	movq	%rbx, %rdi
0000000000215cfa	callq	*0x60(%rax)
0000000000215cfd	jmp	0x215e70
0000000000215d02	movq	(%rbx), %rax
0000000000215d05	movq	%rbx, %rdi
0000000000215d08	movl	$0x1, %esi
0000000000215d0d	xorl	%edx, %edx
0000000000215d0f	callq	*0x48(%rax)
0000000000215d12	movq	(%rbx), %rax
0000000000215d15	movq	%rbx, %rdi
0000000000215d18	xorl	%esi, %esi
0000000000215d1a	xorl	%edx, %edx
0000000000215d1c	callq	*0x30(%rax)
0000000000215d1f	movq	%rbx, %rdi
0000000000215d22	movl	$0x1, %esi
0000000000215d27	xorl	%edx, %edx
0000000000215d29	xorl	%ecx, %ecx
0000000000215d2b	xorl	%r8d, %r8d
0000000000215d2e	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215d33	movq	0x90(%rbx), %rdi
0000000000215d3a	movq	(%rdi), %rax
0000000000215d3d	movl	$0x2e, %esi
0000000000215d42	callq	*0x80(%rax)
0000000000215d48	testl	%eax, %eax
0000000000215d4a	jne	0x215d58
0000000000215d4c	movq	(%rbx), %rax
0000000000215d4f	movq	%rbx, %rdi
0000000000215d52	callq	*0xa8(%rax)
0000000000215d58	movq	(%rbx), %rax
0000000000215d5b	movsd	0x1b44fd(%rip), %xmm1
0000000000215d63	xorps	%xmm0, %xmm0
0000000000215d66	xorps	%xmm2, %xmm2
0000000000215d69	movq	%rbx, %rdi
0000000000215d6c	callq	*0x60(%rax)
0000000000215d6f	xorl	%r14d, %r14d
0000000000215d72	movq	%rbx, %rdi
0000000000215d75	movl	$0x4, %esi
0000000000215d7a	xorl	%edx, %edx
0000000000215d7c	xorl	%ecx, %ecx
0000000000215d7e	xorl	%r8d, %r8d
0000000000215d81	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215d86	movq	0x90(%rbx), %rdi
0000000000215d8d	movq	(%rdi), %rax
0000000000215d90	movl	$0x2e, %esi
0000000000215d95	callq	*0x80(%rax)
0000000000215d9b	testl	%eax, %eax
0000000000215d9d	jne	0x215dab
0000000000215d9f	movq	(%rbx), %rax
0000000000215da2	movq	%rbx, %rdi
0000000000215da5	callq	*0xa8(%rax)
0000000000215dab	movq	(%rbx), %rax
0000000000215dae	movsd	0x1b44aa(%rip), %xmm0
0000000000215db6	xorps	%xmm2, %xmm2
0000000000215db9	movq	%rbx, %rdi
0000000000215dbc	movaps	%xmm0, %xmm1
0000000000215dbf	callq	*0x60(%rax)
0000000000215dc2	jmp	0x215e70
0000000000215dc7	movq	(%rbx), %rax
0000000000215dca	xorl	%r14d, %r14d
0000000000215dcd	movq	%rbx, %rdi
0000000000215dd0	movl	$0x2, %esi
0000000000215dd5	xorl	%edx, %edx
0000000000215dd7	callq	*0x48(%rax)
0000000000215dda	movq	(%rbx), %rax
0000000000215ddd	movq	%rbx, %rdi
0000000000215de0	xorl	%esi, %esi
0000000000215de2	xorl	%edx, %edx
0000000000215de4	callq	*0x30(%rax)
0000000000215de7	movq	%rbx, %rdi
0000000000215dea	movl	$0x5, %esi
0000000000215def	xorl	%edx, %edx
0000000000215df1	xorl	%ecx, %ecx
0000000000215df3	xorl	%r8d, %r8d
0000000000215df6	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215dfb	movq	0x90(%rbx), %rdi
0000000000215e02	movq	(%rdi), %rax
0000000000215e05	movl	$0x2e, %esi
0000000000215e0a	callq	*0x80(%rax)
0000000000215e10	testl	%eax, %eax
0000000000215e12	jne	0x215e20
0000000000215e14	movq	(%rbx), %rax
0000000000215e17	movq	%rbx, %rdi
0000000000215e1a	callq	*0xa8(%rax)
0000000000215e20	movq	(%rbx), %rax
0000000000215e23	movsd	0x1b44d5(%rip), %xmm1
0000000000215e2b	xorps	%xmm0, %xmm0
0000000000215e2e	xorps	%xmm2, %xmm2
0000000000215e31	movq	%rbx, %rdi
0000000000215e34	callq	*0x60(%rax)
0000000000215e37	movq	%rbx, %rdi
0000000000215e3a	movl	$0x2, %esi
0000000000215e3f	xorl	%edx, %edx
0000000000215e41	xorl	%ecx, %ecx
0000000000215e43	xorl	%r8d, %r8d
0000000000215e46	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000215e4b	movq	0x90(%rbx), %rdi
0000000000215e52	movq	(%rdi), %rax
0000000000215e55	movl	$0x2e, %esi
0000000000215e5a	callq	*0x80(%rax)
0000000000215e60	testl	%eax, %eax
0000000000215e62	jne	0x215e70
0000000000215e64	movq	(%rbx), %rax
0000000000215e67	movq	%rbx, %rdi
0000000000215e6a	callq	*0xa8(%rax)
0000000000215e70	movl	%r14d, %eax
0000000000215e73	popq	%rbx
0000000000215e74	popq	%r14
0000000000215e76	popq	%rbp
0000000000215e77	retq
0000000000215e78	nopl	(%rax,%rax)
