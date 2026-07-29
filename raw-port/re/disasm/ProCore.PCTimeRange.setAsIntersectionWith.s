__ZN11PCTimeRange21setAsIntersectionWithERKS_RK6CMTime:
000000000001faba	pushq	%rbp
000000000001fabb	movq	%rsp, %rbp
000000000001fabe	pushq	%r15
000000000001fac0	pushq	%r14
000000000001fac2	pushq	%r13
000000000001fac4	pushq	%r12
000000000001fac6	pushq	%rbx
000000000001fac7	subq	$0x148, %rsp                    ## imm = 0x148
000000000001face	movq	%rdx, %r15
000000000001fad1	movq	%rsi, %r12
000000000001fad4	movq	%rdi, %r14
000000000001fad7	movq	0x10(%rdi), %rax
000000000001fadb	leaq	-0xd0(%rbp), %rcx
000000000001fae2	movq	%rax, 0x10(%rcx)
000000000001fae6	movups	(%rdi), %xmm0
000000000001fae9	movaps	%xmm0, (%rcx)
000000000001faec	leaq	0x18(%rdi), %rax
000000000001faf0	movq	%rax, -0x30(%rbp)
000000000001faf4	movq	0x10(%rdi), %rax
000000000001faf8	leaq	-0x90(%rbp), %r13
000000000001faff	movq	%rax, 0x10(%r13)
000000000001fb03	movups	(%rdi), %xmm0
000000000001fb06	movaps	%xmm0, (%r13)
000000000001fb0b	movq	0x28(%rdi), %rax
000000000001fb0f	leaq	-0xf0(%rbp), %rbx
000000000001fb16	movq	%rax, 0x10(%rbx)
000000000001fb1a	movups	0x18(%rdi), %xmm0
000000000001fb1e	movaps	%xmm0, (%rbx)
000000000001fb21	movq	0x10(%rbx), %rax
000000000001fb25	movq	%rax, 0x28(%rsp)
000000000001fb2a	movaps	(%rbx), %xmm0
000000000001fb2d	movups	%xmm0, 0x18(%rsp)
000000000001fb32	movq	0x10(%r13), %rax
000000000001fb36	movq	%rax, 0x10(%rsp)
000000000001fb3b	movaps	(%r13), %xmm0
000000000001fb40	movups	%xmm0, (%rsp)
000000000001fb44	leaq	-0x70(%rbp), %rdi
000000000001fb48	callq	_PC_CMTimeSaferAdd
000000000001fb4d	movq	0x10(%r15), %rax
000000000001fb51	movq	%rax, 0x10(%r13)
000000000001fb55	movups	(%r15), %xmm0
000000000001fb59	movaps	%xmm0, (%r13)
000000000001fb5e	movq	0x10(%r13), %rax
000000000001fb62	movq	%rax, 0x28(%rsp)
000000000001fb67	movaps	(%r13), %xmm0
000000000001fb6c	movups	%xmm0, 0x18(%rsp)
000000000001fb71	leaq	-0x70(%rbp), %rcx
000000000001fb75	movq	0x10(%rcx), %rax
000000000001fb79	movq	%rax, 0x10(%rsp)
000000000001fb7e	movups	(%rcx), %xmm0
000000000001fb81	movups	%xmm0, (%rsp)
000000000001fb85	leaq	-0x108(%rbp), %rdi
000000000001fb8c	callq	_PC_CMTimeSaferSubtract
000000000001fb91	movq	0x10(%r12), %rax
000000000001fb96	movq	%rax, 0x10(%rbx)
000000000001fb9a	movups	(%r12), %xmm0
000000000001fb9f	movaps	%xmm0, (%rbx)
000000000001fba2	movq	0x10(%r12), %rax
000000000001fba7	movq	%rax, 0x10(%r13)
000000000001fbab	movups	(%r12), %xmm0
000000000001fbb0	movaps	%xmm0, (%r13)
000000000001fbb5	movq	0x28(%r12), %rax
000000000001fbba	leaq	-0x70(%rbp), %rcx
000000000001fbbe	movq	%rax, 0x10(%rcx)
000000000001fbc2	movups	0x18(%r12), %xmm0
000000000001fbc8	movaps	%xmm0, (%rcx)
000000000001fbcb	movq	0x10(%rcx), %rax
000000000001fbcf	movq	%rax, 0x28(%rsp)
000000000001fbd4	movaps	(%rcx), %xmm0
000000000001fbd7	movups	%xmm0, 0x18(%rsp)
000000000001fbdc	movq	0x10(%r13), %rax
000000000001fbe0	movq	%rax, 0x10(%rsp)
000000000001fbe5	movaps	(%r13), %xmm0
000000000001fbea	movups	%xmm0, (%rsp)
000000000001fbee	leaq	-0x138(%rbp), %r12
000000000001fbf5	movq	%r12, %rdi
000000000001fbf8	callq	_PC_CMTimeSaferAdd
000000000001fbfd	movq	0x10(%r15), %rax
000000000001fc01	movq	%rax, 0x10(%r13)
000000000001fc05	movq	%r15, -0x58(%rbp)
000000000001fc09	movups	(%r15), %xmm0
000000000001fc0d	movaps	%xmm0, (%r13)
000000000001fc12	movq	0x10(%r13), %rax
000000000001fc16	movq	%rax, 0x28(%rsp)
000000000001fc1b	movaps	(%r13), %xmm0
000000000001fc20	movups	%xmm0, 0x18(%rsp)
000000000001fc25	movq	0x10(%r12), %rax
000000000001fc2a	movq	%rax, 0x10(%rsp)
000000000001fc2f	movups	(%r12), %xmm0
000000000001fc34	movups	%xmm0, (%rsp)
000000000001fc38	leaq	-0x120(%rbp), %r12
000000000001fc3f	movq	%r12, %rdi
000000000001fc42	callq	_PC_CMTimeSaferSubtract
000000000001fc47	movq	0x10(%r12), %rax
000000000001fc4c	movq	%rax, 0x10(%r13)
000000000001fc50	movups	(%r12), %xmm0
000000000001fc55	movaps	%xmm0, (%r13)
000000000001fc5a	leaq	-0x108(%rbp), %rax
000000000001fc61	movups	(%rax), %xmm0
000000000001fc64	leaq	-0x70(%rbp), %r12
000000000001fc68	movaps	%xmm0, (%r12)
000000000001fc6d	movq	0x10(%rax), %rax
000000000001fc71	movq	%rax, 0x10(%r12)
000000000001fc76	movq	0x10(%rbx), %rax
000000000001fc7a	movq	%rax, 0x28(%rsp)
000000000001fc7f	movaps	(%rbx), %xmm0
000000000001fc82	movups	%xmm0, 0x18(%rsp)
000000000001fc87	leaq	-0xd0(%rbp), %r15
000000000001fc8e	movq	0x10(%r15), %rax
000000000001fc92	movq	%rax, 0x10(%rsp)
000000000001fc97	movaps	(%r15), %xmm0
000000000001fc9b	movups	%xmm0, (%rsp)
000000000001fc9f	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001fca4	testl	%eax, %eax
000000000001fca6	cmovgq	%r15, %rbx
000000000001fcaa	movups	(%rbx), %xmm0
000000000001fcad	movaps	%xmm0, -0x50(%rbp)
000000000001fcb1	movq	0x10(%rbx), %rax
000000000001fcb5	movq	%rax, -0x40(%rbp)
000000000001fcb9	movq	0x10(%r13), %rax
000000000001fcbd	movq	%rax, 0x28(%rsp)
000000000001fcc2	movaps	(%r13), %xmm0
000000000001fcc7	movups	%xmm0, 0x18(%rsp)
000000000001fccc	movq	0x10(%r12), %rax
000000000001fcd1	movq	%rax, 0x10(%rsp)
000000000001fcd6	movaps	(%r12), %xmm0
000000000001fcdb	movups	%xmm0, (%rsp)
000000000001fcdf	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001fce4	testl	%eax, %eax
000000000001fce6	cmovsq	%r12, %r13
000000000001fcea	movups	(%r13), %xmm0
000000000001fcef	movaps	%xmm0, -0xb0(%rbp)
000000000001fcf6	movq	0x10(%r13), %rax
000000000001fcfa	movq	%rax, -0xa0(%rbp)
000000000001fd01	movq	0x10(%r13), %rax
000000000001fd05	movq	%rax, 0x28(%rsp)
000000000001fd0a	movups	(%r13), %xmm0
000000000001fd0f	movups	%xmm0, 0x18(%rsp)
000000000001fd14	movq	-0x40(%rbp), %rax
000000000001fd18	movq	%rax, 0x10(%rsp)
000000000001fd1d	movaps	-0x50(%rbp), %xmm0
000000000001fd21	movups	%xmm0, (%rsp)
000000000001fd25	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001fd2a	testl	%eax, %eax
000000000001fd2c	jle	0x1fd5b
000000000001fd2e	movq	0x127aeb(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
000000000001fd35	movq	0x10(%rax), %rcx
000000000001fd39	movq	%rcx, 0x10(%r14)
000000000001fd3d	movups	(%rax), %xmm0
000000000001fd40	movups	%xmm0, (%r14)
000000000001fd44	movq	0x10(%rax), %rcx
000000000001fd48	movq	-0x30(%rbp), %rdx
000000000001fd4c	movq	%rcx, 0x10(%rdx)
000000000001fd50	movups	(%rax), %xmm0
000000000001fd53	movups	%xmm0, (%rdx)
000000000001fd56	jmp	0x1fdfd
000000000001fd5b	movq	-0x40(%rbp), %rax
000000000001fd5f	movq	%rax, 0x10(%r14)
000000000001fd63	movaps	-0x50(%rbp), %xmm0
000000000001fd67	movups	%xmm0, (%r14)
000000000001fd6b	movq	-0x40(%rbp), %rax
000000000001fd6f	movq	%rax, 0x28(%rsp)
000000000001fd74	movaps	-0x50(%rbp), %xmm0
000000000001fd78	movups	%xmm0, 0x18(%rsp)
000000000001fd7d	movq	-0xa0(%rbp), %rax
000000000001fd84	movq	%rax, 0x10(%rsp)
000000000001fd89	movaps	-0xb0(%rbp), %xmm0
000000000001fd90	movups	%xmm0, (%rsp)
000000000001fd94	leaq	-0x70(%rbp), %r14
000000000001fd98	movq	%r14, %rdi
000000000001fd9b	callq	_PC_CMTimeSaferSubtract
000000000001fda0	movq	-0x58(%rbp), %rcx
000000000001fda4	movq	0x10(%rcx), %rax
000000000001fda8	movq	%rax, -0x80(%rbp)
000000000001fdac	movups	(%rcx), %xmm0
000000000001fdaf	movaps	%xmm0, -0x90(%rbp)
000000000001fdb6	movq	-0x80(%rbp), %rax
000000000001fdba	movq	%rax, 0x28(%rsp)
000000000001fdbf	movaps	-0x90(%rbp), %xmm0
000000000001fdc6	movups	%xmm0, 0x18(%rsp)
000000000001fdcb	movq	0x10(%r14), %rax
000000000001fdcf	movq	%rax, 0x10(%rsp)
000000000001fdd4	movups	(%r14), %xmm0
000000000001fdd8	movups	%xmm0, (%rsp)
000000000001fddc	leaq	-0xf0(%rbp), %rbx
000000000001fde3	movq	%rbx, %rdi
000000000001fde6	callq	_PC_CMTimeSaferAdd
000000000001fdeb	movq	0x10(%rbx), %rax
000000000001fdef	movq	-0x30(%rbp), %rcx
000000000001fdf3	movq	%rax, 0x10(%rcx)
000000000001fdf7	movups	(%rbx), %xmm0
000000000001fdfa	movups	%xmm0, (%rcx)
000000000001fdfd	addq	$0x148, %rsp                    ## imm = 0x148
000000000001fe04	popq	%rbx
000000000001fe05	popq	%r12
000000000001fe07	popq	%r13
000000000001fe09	popq	%r14
000000000001fe0b	popq	%r15
000000000001fe0d	popq	%rbp
000000000001fe0e	retq
000000000001fe0f	nop
