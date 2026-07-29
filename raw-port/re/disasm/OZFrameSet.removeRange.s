__ZN10OZFrameSet11removeRangeERK11PCTimeRange6CMTime:
0000000000376ae0	cmpq	$0x0, 0x10(%rdi)
0000000000376ae5	je	0x376ca1
0000000000376aeb	pushq	%rbp
0000000000376aec	movq	%rsp, %rbp
0000000000376aef	pushq	%r15
0000000000376af1	pushq	%r14
0000000000376af3	pushq	%r13
0000000000376af5	pushq	%r12
0000000000376af7	pushq	%rbx
0000000000376af8	subq	$0x138, %rsp                    ## imm = 0x138
0000000000376aff	movq	%rsi, %r13
0000000000376b02	movq	(%rdi), %rbx
0000000000376b05	movq	%rdi, -0x128(%rbp)
0000000000376b0c	leaq	0x8(%rdi), %r15
0000000000376b10	cmpq	%r15, %rbx
0000000000376b13	movq	%r15, -0x108(%rbp)
0000000000376b1a	je	0x376cc0
0000000000376b20	leaq	0x18(%r13), %r14
0000000000376b24	leaq	-0xa0(%rbp), %r12
0000000000376b2b	jmp	0x376b3c
0000000000376b2d	nopl	(%rax)
0000000000376b30	movq	%rax, %rbx
0000000000376b33	cmpq	%r15, %rax
0000000000376b36	je	0x376ca4
0000000000376b3c	movq	0x2c(%rbx), %rax
0000000000376b40	movq	%rax, -0xf0(%rbp)
0000000000376b47	movups	0x1c(%rbx), %xmm0
0000000000376b4b	movaps	%xmm0, -0x100(%rbp)
0000000000376b52	movq	0x2c(%rbx), %rax
0000000000376b56	movq	%rax, -0xc0(%rbp)
0000000000376b5d	movups	0x1c(%rbx), %xmm0
0000000000376b61	movaps	%xmm0, -0xd0(%rbp)
0000000000376b68	movq	0x44(%rbx), %rax
0000000000376b6c	movq	%rax, -0x30(%rbp)
0000000000376b70	movups	0x34(%rbx), %xmm0
0000000000376b74	movaps	%xmm0, -0x40(%rbp)
0000000000376b78	movq	-0x30(%rbp), %rax
0000000000376b7c	movq	%rax, 0x28(%rsp)
0000000000376b81	movaps	-0x40(%rbp), %xmm0
0000000000376b85	movups	%xmm0, 0x18(%rsp)
0000000000376b8a	movq	-0xc0(%rbp), %rax
0000000000376b91	movq	%rax, 0x10(%rsp)
0000000000376b96	movaps	-0xd0(%rbp), %xmm0
0000000000376b9d	movups	%xmm0, (%rsp)
0000000000376ba1	leaq	-0x60(%rbp), %rdi
0000000000376ba5	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376baa	movups	(%r13), %xmm0
0000000000376baf	movaps	%xmm0, -0x80(%rbp)
0000000000376bb3	movq	0x10(%r13), %rax
0000000000376bb7	movq	%rax, -0x70(%rbp)
0000000000376bbb	movq	0x10(%r13), %rax
0000000000376bbf	movq	%rax, -0xc0(%rbp)
0000000000376bc6	movups	(%r13), %xmm0
0000000000376bcb	movaps	%xmm0, -0xd0(%rbp)
0000000000376bd2	movq	0x10(%r14), %rax
0000000000376bd6	movq	%rax, -0x30(%rbp)
0000000000376bda	movups	(%r14), %xmm0
0000000000376bde	movaps	%xmm0, -0x40(%rbp)
0000000000376be2	movq	-0x30(%rbp), %rax
0000000000376be6	movq	%rax, 0x28(%rsp)
0000000000376beb	movaps	-0x40(%rbp), %xmm0
0000000000376bef	movups	%xmm0, 0x18(%rsp)
0000000000376bf4	movq	-0xc0(%rbp), %rax
0000000000376bfb	movq	%rax, 0x10(%rsp)
0000000000376c00	movaps	-0xd0(%rbp), %xmm0
0000000000376c07	movups	%xmm0, (%rsp)
0000000000376c0b	movq	%r12, %rdi
0000000000376c0e	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376c13	movq	-0xf0(%rbp), %rax
0000000000376c1a	movq	%rax, 0x28(%rsp)
0000000000376c1f	movaps	-0x100(%rbp), %xmm0
0000000000376c26	movups	%xmm0, 0x18(%rsp)
0000000000376c2b	movq	-0x90(%rbp), %rax
0000000000376c32	movq	%rax, 0x10(%rsp)
0000000000376c37	movups	-0xa0(%rbp), %xmm0
0000000000376c3e	movups	%xmm0, (%rsp)
0000000000376c42	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000376c47	testl	%eax, %eax
0000000000376c49	js	0x376c77
0000000000376c4b	movq	-0x50(%rbp), %rax
0000000000376c4f	movq	%rax, 0x28(%rsp)
0000000000376c54	movups	-0x60(%rbp), %xmm0
0000000000376c58	movups	%xmm0, 0x18(%rsp)
0000000000376c5d	movq	-0x70(%rbp), %rax
0000000000376c61	movq	%rax, 0x10(%rsp)
0000000000376c66	movaps	-0x80(%rbp), %xmm0
0000000000376c6a	movups	%xmm0, (%rsp)
0000000000376c6e	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000376c73	testl	%eax, %eax
0000000000376c75	jle	0x376cd9
0000000000376c77	movq	0x8(%rbx), %rcx
0000000000376c7b	testq	%rcx, %rcx
0000000000376c7e	je	0x376c90
0000000000376c80	movq	%rcx, %rax
0000000000376c83	movq	(%rcx), %rcx
0000000000376c86	testq	%rcx, %rcx
0000000000376c89	jne	0x376c80
0000000000376c8b	jmp	0x376b30
0000000000376c90	movq	0x10(%rbx), %rax
0000000000376c94	cmpq	(%rax), %rbx
0000000000376c97	movq	%rax, %rbx
0000000000376c9a	jne	0x376c90
0000000000376c9c	jmp	0x376b30
0000000000376ca1	xorl	%eax, %eax
0000000000376ca3	retq
0000000000376ca4	movb	$0x1, %cl
0000000000376ca6	movl	%ecx, -0x84(%rbp)
0000000000376cac	movq	%rax, %rbx
0000000000376caf	movq	%rbx, %r15
0000000000376cb2	cmpq	-0x108(%rbp), %rbx
0000000000376cb9	jne	0x376cf3
0000000000376cbb	jmp	0x376e84
0000000000376cc0	movb	$0x1, %al
0000000000376cc2	movl	%eax, -0x84(%rbp)
0000000000376cc8	movq	%rbx, %r15
0000000000376ccb	cmpq	-0x108(%rbp), %rbx
0000000000376cd2	jne	0x376cf3
0000000000376cd4	jmp	0x376e84
0000000000376cd9	movl	$0x0, -0x84(%rbp)
0000000000376ce3	movq	%rbx, %r15
0000000000376ce6	cmpq	-0x108(%rbp), %rbx
0000000000376ced	je	0x376e84
0000000000376cf3	leaq	0x18(%r13), %r12
0000000000376cf7	movq	%rbx, %r14
0000000000376cfa	jmp	0x376d10
0000000000376cfc	nopl	(%rax)
0000000000376d00	movq	%r15, %r14
0000000000376d03	cmpq	-0x108(%rbp), %r15
0000000000376d0a	je	0x376e84
0000000000376d10	movq	0x2c(%r14), %rax
0000000000376d14	movq	%rax, -0xf0(%rbp)
0000000000376d1b	movups	0x1c(%r14), %xmm0
0000000000376d20	movaps	%xmm0, -0x100(%rbp)
0000000000376d27	movq	0x2c(%r14), %rax
0000000000376d2b	movq	%rax, -0xc0(%rbp)
0000000000376d32	movups	0x1c(%r14), %xmm0
0000000000376d37	movaps	%xmm0, -0xd0(%rbp)
0000000000376d3e	movq	0x44(%r14), %rax
0000000000376d42	movq	%rax, -0x30(%rbp)
0000000000376d46	movups	0x34(%r14), %xmm0
0000000000376d4b	movaps	%xmm0, -0x40(%rbp)
0000000000376d4f	movq	-0x30(%rbp), %rax
0000000000376d53	movq	%rax, 0x28(%rsp)
0000000000376d58	movaps	-0x40(%rbp), %xmm0
0000000000376d5c	movups	%xmm0, 0x18(%rsp)
0000000000376d61	movq	-0xc0(%rbp), %rax
0000000000376d68	movq	%rax, 0x10(%rsp)
0000000000376d6d	movaps	-0xd0(%rbp), %xmm0
0000000000376d74	movups	%xmm0, (%rsp)
0000000000376d78	leaq	-0x60(%rbp), %rdi
0000000000376d7c	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376d81	movups	(%r13), %xmm0
0000000000376d86	movaps	%xmm0, -0x80(%rbp)
0000000000376d8a	movq	0x10(%r13), %rax
0000000000376d8e	movq	%rax, -0x70(%rbp)
0000000000376d92	movq	0x10(%r13), %rax
0000000000376d96	movq	%rax, -0xc0(%rbp)
0000000000376d9d	movups	(%r13), %xmm0
0000000000376da2	movaps	%xmm0, -0xd0(%rbp)
0000000000376da9	movq	0x10(%r12), %rax
0000000000376dae	movq	%rax, -0x30(%rbp)
0000000000376db2	movups	(%r12), %xmm0
0000000000376db7	movaps	%xmm0, -0x40(%rbp)
0000000000376dbb	movq	-0x30(%rbp), %rax
0000000000376dbf	movq	%rax, 0x28(%rsp)
0000000000376dc4	movaps	-0x40(%rbp), %xmm0
0000000000376dc8	movups	%xmm0, 0x18(%rsp)
0000000000376dcd	movq	-0xc0(%rbp), %rax
0000000000376dd4	movq	%rax, 0x10(%rsp)
0000000000376dd9	movaps	-0xd0(%rbp), %xmm0
0000000000376de0	movups	%xmm0, (%rsp)
0000000000376de4	leaq	-0xa0(%rbp), %rdi
0000000000376deb	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376df0	movq	-0xf0(%rbp), %rax
0000000000376df7	movq	%rax, 0x28(%rsp)
0000000000376dfc	movaps	-0x100(%rbp), %xmm0
0000000000376e03	movups	%xmm0, 0x18(%rsp)
0000000000376e08	movq	-0x90(%rbp), %rax
0000000000376e0f	movq	%rax, 0x10(%rsp)
0000000000376e14	movups	-0xa0(%rbp), %xmm0
0000000000376e1b	movups	%xmm0, (%rsp)
0000000000376e1f	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000376e24	testl	%eax, %eax
0000000000376e26	js	0x376e81
0000000000376e28	movq	-0x50(%rbp), %rax
0000000000376e2c	movq	%rax, 0x28(%rsp)
0000000000376e31	movups	-0x60(%rbp), %xmm0
0000000000376e35	movups	%xmm0, 0x18(%rsp)
0000000000376e3a	movq	-0x70(%rbp), %rax
0000000000376e3e	movq	%rax, 0x10(%rsp)
0000000000376e43	movaps	-0x80(%rbp), %xmm0
0000000000376e47	movups	%xmm0, (%rsp)
0000000000376e4b	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000376e50	testl	%eax, %eax
0000000000376e52	jg	0x376e94
0000000000376e54	movq	0x8(%r14), %rax
0000000000376e58	testq	%rax, %rax
0000000000376e5b	je	0x376e70
0000000000376e5d	nopl	(%rax)
0000000000376e60	movq	%rax, %r15
0000000000376e63	movq	(%rax), %rax
0000000000376e66	testq	%rax, %rax
0000000000376e69	jne	0x376e60
0000000000376e6b	jmp	0x376d00
0000000000376e70	movq	0x10(%r14), %r15
0000000000376e74	cmpq	(%r15), %r14
0000000000376e77	movq	%r15, %r14
0000000000376e7a	jne	0x376e70
0000000000376e7c	jmp	0x376d00
0000000000376e81	movq	%r14, %r15
0000000000376e84	cmpb	$0x0, -0x84(%rbp)
0000000000376e8b	je	0x376ea0
0000000000376e8d	xorl	%eax, %eax
0000000000376e8f	jmp	0x37776a
0000000000376e94	movq	%r14, %r15
0000000000376e97	cmpb	$0x0, -0x84(%rbp)
0000000000376e9e	jne	0x376e8d
0000000000376ea0	leaq	0x10(%rbp), %r14
0000000000376ea4	movq	0x4ad665(%rip), %rcx            ## literal pool symbol address: _kCMTimeZero
0000000000376eab	movq	0x10(%rcx), %rax
0000000000376eaf	movq	%rax, -0xf0(%rbp)
0000000000376eb6	movups	(%rcx), %xmm0
0000000000376eb9	movaps	%xmm0, -0x100(%rbp)
0000000000376ec0	movups	%xmm0, -0xe8(%rbp)
0000000000376ec7	movq	%rax, -0xd8(%rbp)
0000000000376ece	movq	%rax, -0xc0(%rbp)
0000000000376ed5	movaps	%xmm0, -0xd0(%rbp)
0000000000376edc	movups	%xmm0, -0xb8(%rbp)
0000000000376ee3	movq	%rax, -0xa8(%rbp)
0000000000376eea	movq	0x2c(%rbx), %rax
0000000000376eee	movq	%rax, -0x30(%rbp)
0000000000376ef2	movups	0x1c(%rbx), %xmm0
0000000000376ef6	movaps	%xmm0, -0x40(%rbp)
0000000000376efa	movq	0x10(%r13), %rax
0000000000376efe	movq	%rax, -0x50(%rbp)
0000000000376f02	movups	(%r13), %xmm0
0000000000376f07	movaps	%xmm0, -0x60(%rbp)
0000000000376f0b	movq	-0x50(%rbp), %rax
0000000000376f0f	movq	%rax, 0x28(%rsp)
0000000000376f14	movaps	-0x60(%rbp), %xmm0
0000000000376f18	movups	%xmm0, 0x18(%rsp)
0000000000376f1d	movq	-0x30(%rbp), %rax
0000000000376f21	movq	%rax, 0x10(%rsp)
0000000000376f26	movaps	-0x40(%rbp), %xmm0
0000000000376f2a	movups	%xmm0, (%rsp)
0000000000376f2e	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000376f33	testl	%eax, %eax
0000000000376f35	js	0x3770b1
0000000000376f3b	cmpq	%r15, %rbx
0000000000376f3e	je	0x37718d
0000000000376f44	movq	(%r15), %rax
0000000000376f47	testq	%rax, %rax
0000000000376f4a	je	0x376f60
0000000000376f4c	nopl	(%rax)
0000000000376f50	movq	%rax, %r12
0000000000376f53	movq	0x8(%rax), %rax
0000000000376f57	testq	%rax, %rax
0000000000376f5a	jne	0x376f50
0000000000376f5c	jmp	0x376f6d
0000000000376f5e	nop
0000000000376f60	movq	0x10(%r15), %r12
0000000000376f64	cmpq	(%r12), %r15
0000000000376f68	movq	%r12, %r15
0000000000376f6b	je	0x376f60
0000000000376f6d	movq	0x10(%r13), %rax
0000000000376f71	movq	%rax, -0x30(%rbp)
0000000000376f75	movups	(%r13), %xmm0
0000000000376f7a	movaps	%xmm0, -0x40(%rbp)
0000000000376f7e	movq	0x28(%r13), %rax
0000000000376f82	movq	%rax, -0x50(%rbp)
0000000000376f86	movups	0x18(%r13), %xmm0
0000000000376f8b	movaps	%xmm0, -0x60(%rbp)
0000000000376f8f	movq	-0x50(%rbp), %rax
0000000000376f93	movq	%rax, 0x28(%rsp)
0000000000376f98	movaps	-0x60(%rbp), %xmm0
0000000000376f9c	movups	%xmm0, 0x18(%rsp)
0000000000376fa1	movq	-0x30(%rbp), %rax
0000000000376fa5	movq	%rax, 0x10(%rsp)
0000000000376faa	movaps	-0x40(%rbp), %xmm0
0000000000376fae	movups	%xmm0, (%rsp)
0000000000376fb2	leaq	-0x80(%rbp), %rdi
0000000000376fb6	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000376fbb	movq	0x10(%r14), %rax
0000000000376fbf	movq	%rax, 0x28(%rsp)
0000000000376fc4	movups	(%r14), %xmm0
0000000000376fc8	movups	%xmm0, 0x18(%rsp)
0000000000376fcd	movq	-0x70(%rbp), %rax
0000000000376fd1	movq	%rax, 0x10(%rsp)
0000000000376fd6	movups	-0x80(%rbp), %xmm0
0000000000376fda	movups	%xmm0, (%rsp)
0000000000376fde	leaq	-0xa0(%rbp), %rdi
0000000000376fe5	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000376fea	movq	0x2c(%r12), %rax
0000000000376fef	movq	%rax, -0x30(%rbp)
0000000000376ff3	movups	0x1c(%r12), %xmm0
0000000000376ff9	movaps	%xmm0, -0x40(%rbp)
0000000000376ffd	movq	0x44(%r12), %rax
0000000000377002	movq	%rax, -0x50(%rbp)
0000000000377006	movups	0x34(%r12), %xmm0
000000000037700c	movaps	%xmm0, -0x60(%rbp)
0000000000377010	movq	-0x50(%rbp), %rax
0000000000377014	movq	%rax, 0x28(%rsp)
0000000000377019	movaps	-0x60(%rbp), %xmm0
000000000037701d	movups	%xmm0, 0x18(%rsp)
0000000000377022	movq	-0x30(%rbp), %rax
0000000000377026	movq	%rax, 0x10(%rsp)
000000000037702b	movaps	-0x40(%rbp), %xmm0
000000000037702f	movups	%xmm0, (%rsp)
0000000000377033	leaq	-0x80(%rbp), %rdi
0000000000377037	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000037703c	movq	0x10(%r14), %rax
0000000000377040	movq	%rax, 0x28(%rsp)
0000000000377045	movups	(%r14), %xmm0
0000000000377049	movups	%xmm0, 0x18(%rsp)
000000000037704e	movq	-0x70(%rbp), %rax
0000000000377052	movq	%rax, 0x10(%rsp)
0000000000377057	movups	-0x80(%rbp), %xmm0
000000000037705b	movups	%xmm0, (%rsp)
000000000037705f	leaq	-0x40(%rbp), %rdi
0000000000377063	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377068	movq	-0x30(%rbp), %rax
000000000037706c	movq	%rax, 0x28(%rsp)
0000000000377071	movups	-0x40(%rbp), %xmm0
0000000000377075	movups	%xmm0, 0x18(%rsp)
000000000037707a	movq	-0x90(%rbp), %rax
0000000000377081	movq	%rax, 0x10(%rsp)
0000000000377086	movups	-0xa0(%rbp), %xmm0
000000000037708d	movups	%xmm0, (%rsp)
0000000000377091	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000377096	testl	%eax, %eax
0000000000377098	js	0x37741c
000000000037709e	movq	0x8(%r12), %rax
00000000003770a3	testq	%rax, %rax
00000000003770a6	jne	0x377580
00000000003770ac	jmp	0x377590
00000000003770b1	leaq	0x1c(%rbx), %rax
00000000003770b5	movq	0x10(%rax), %rcx
00000000003770b9	movq	%rcx, -0x110(%rbp)
00000000003770c0	movups	(%rax), %xmm0
00000000003770c3	movaps	%xmm0, -0x120(%rbp)
00000000003770ca	movq	0x10(%r13), %rax
00000000003770ce	movq	%rax, -0x30(%rbp)
00000000003770d2	movups	(%r13), %xmm0
00000000003770d7	movaps	%xmm0, -0x40(%rbp)
00000000003770db	movq	0x10(%r14), %rax
00000000003770df	movq	%rax, 0x28(%rsp)
00000000003770e4	movups	(%r14), %xmm0
00000000003770e8	movups	%xmm0, 0x18(%rsp)
00000000003770ed	movq	-0x30(%rbp), %rax
00000000003770f1	movq	%rax, 0x10(%rsp)
00000000003770f6	movaps	-0x40(%rbp), %xmm0
00000000003770fa	movups	%xmm0, (%rsp)
00000000003770fe	leaq	-0x60(%rbp), %rdi
0000000000377102	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377107	movaps	-0x120(%rbp), %xmm0
000000000037710e	movaps	%xmm0, -0x100(%rbp)
0000000000377115	movq	-0x110(%rbp), %rax
000000000037711c	movq	%rax, -0xf0(%rbp)
0000000000377123	movq	-0x110(%rbp), %rax
000000000037712a	movq	%rax, 0x28(%rsp)
000000000037712f	movaps	-0x120(%rbp), %xmm0
0000000000377136	movups	%xmm0, 0x18(%rsp)
000000000037713b	movq	-0x50(%rbp), %rax
000000000037713f	movq	%rax, 0x10(%rsp)
0000000000377144	movups	-0x60(%rbp), %xmm0
0000000000377148	movups	%xmm0, (%rsp)
000000000037714c	leaq	-0x40(%rbp), %rdi
0000000000377150	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377155	movq	0x10(%r14), %rax
0000000000377159	movq	%rax, 0x28(%rsp)
000000000037715e	movups	(%r14), %xmm0
0000000000377162	movups	%xmm0, 0x18(%rsp)
0000000000377167	movq	-0x30(%rbp), %rax
000000000037716b	movq	%rax, 0x10(%rsp)
0000000000377170	movups	-0x40(%rbp), %xmm0
0000000000377174	movups	%xmm0, (%rsp)
0000000000377178	leaq	-0xe8(%rbp), %rdi
000000000037717f	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377184	cmpq	%r15, %rbx
0000000000377187	jne	0x376f44
000000000037718d	movq	0x10(%r13), %rax
0000000000377191	movq	%rax, -0x30(%rbp)
0000000000377195	movups	(%r13), %xmm0
000000000037719a	movaps	%xmm0, -0x40(%rbp)
000000000037719e	movq	0x28(%r13), %rax
00000000003771a2	movq	%rax, -0x50(%rbp)
00000000003771a6	movups	0x18(%r13), %xmm0
00000000003771ab	movaps	%xmm0, -0x60(%rbp)
00000000003771af	movq	-0x50(%rbp), %rax
00000000003771b3	movq	%rax, 0x28(%rsp)
00000000003771b8	movaps	-0x60(%rbp), %xmm0
00000000003771bc	movups	%xmm0, 0x18(%rsp)
00000000003771c1	movq	-0x30(%rbp), %rax
00000000003771c5	movq	%rax, 0x10(%rsp)
00000000003771ca	movaps	-0x40(%rbp), %xmm0
00000000003771ce	movups	%xmm0, (%rsp)
00000000003771d2	leaq	-0x80(%rbp), %rdi
00000000003771d6	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
00000000003771db	movq	0x10(%r14), %rax
00000000003771df	movq	%rax, 0x28(%rsp)
00000000003771e4	movups	(%r14), %xmm0
00000000003771e8	movups	%xmm0, 0x18(%rsp)
00000000003771ed	movq	-0x70(%rbp), %rax
00000000003771f1	movq	%rax, 0x10(%rsp)
00000000003771f6	movups	-0x80(%rbp), %xmm0
00000000003771fa	movups	%xmm0, (%rsp)
00000000003771fe	leaq	-0xa0(%rbp), %rdi
0000000000377205	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
000000000037720a	movq	0x2c(%r15), %rax
000000000037720e	movq	%rax, -0x30(%rbp)
0000000000377212	movups	0x1c(%r15), %xmm0
0000000000377217	movaps	%xmm0, -0x40(%rbp)
000000000037721b	movq	0x44(%r15), %rax
000000000037721f	movq	%rax, -0x50(%rbp)
0000000000377223	movups	0x34(%r15), %xmm0
0000000000377228	movaps	%xmm0, -0x60(%rbp)
000000000037722c	movq	-0x50(%rbp), %rax
0000000000377230	movq	%rax, 0x28(%rsp)
0000000000377235	movaps	-0x60(%rbp), %xmm0
0000000000377239	movups	%xmm0, 0x18(%rsp)
000000000037723e	movq	-0x30(%rbp), %rax
0000000000377242	movq	%rax, 0x10(%rsp)
0000000000377247	movaps	-0x40(%rbp), %xmm0
000000000037724b	movups	%xmm0, (%rsp)
000000000037724f	leaq	-0x80(%rbp), %rdi
0000000000377253	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377258	movq	0x10(%r14), %rax
000000000037725c	movq	%rax, 0x28(%rsp)
0000000000377261	movups	(%r14), %xmm0
0000000000377265	movups	%xmm0, 0x18(%rsp)
000000000037726a	movq	-0x70(%rbp), %rax
000000000037726e	movq	%rax, 0x10(%rsp)
0000000000377273	movups	-0x80(%rbp), %xmm0
0000000000377277	movups	%xmm0, (%rsp)
000000000037727b	leaq	-0x40(%rbp), %rdi
000000000037727f	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377284	movq	-0x30(%rbp), %rax
0000000000377288	movq	%rax, 0x28(%rsp)
000000000037728d	movups	-0x40(%rbp), %xmm0
0000000000377291	movups	%xmm0, 0x18(%rsp)
0000000000377296	movq	-0x90(%rbp), %rax
000000000037729d	movq	%rax, 0x10(%rsp)
00000000003772a2	movups	-0xa0(%rbp), %xmm0
00000000003772a9	movups	%xmm0, (%rsp)
00000000003772ad	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000003772b2	movq	%r14, %r12
00000000003772b5	movq	%rbx, %r14
00000000003772b8	testl	%eax, %eax
00000000003772ba	jns	0x37759d
00000000003772c0	leaq	0x18(%r13), %rax
00000000003772c4	leaq	0x1c(%r15), %r14
00000000003772c8	addq	$0x34, %r15
00000000003772cc	movq	0x10(%r13), %rcx
00000000003772d0	movq	%rcx, -0x30(%rbp)
00000000003772d4	movups	(%r13), %xmm0
00000000003772d9	movaps	%xmm0, -0x40(%rbp)
00000000003772dd	movq	0x10(%rax), %rcx
00000000003772e1	movq	%rcx, -0x50(%rbp)
00000000003772e5	movups	(%rax), %xmm0
00000000003772e8	movaps	%xmm0, -0x60(%rbp)
00000000003772ec	movq	-0x50(%rbp), %rax
00000000003772f0	movq	%rax, 0x28(%rsp)
00000000003772f5	movaps	-0x60(%rbp), %xmm0
00000000003772f9	movups	%xmm0, 0x18(%rsp)
00000000003772fe	movq	-0x30(%rbp), %rax
0000000000377302	movq	%rax, 0x10(%rsp)
0000000000377307	movaps	-0x40(%rbp), %xmm0
000000000037730b	movups	%xmm0, (%rsp)
000000000037730f	leaq	-0xa0(%rbp), %rdi
0000000000377316	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
000000000037731b	movq	0x10(%r14), %rax
000000000037731f	movq	%rax, -0x30(%rbp)
0000000000377323	movups	(%r14), %xmm0
0000000000377327	movaps	%xmm0, -0x40(%rbp)
000000000037732b	movq	0x10(%r15), %rax
000000000037732f	movq	%rax, -0x50(%rbp)
0000000000377333	movups	(%r15), %xmm0
0000000000377337	movaps	%xmm0, -0x60(%rbp)
000000000037733b	movq	-0x50(%rbp), %rax
000000000037733f	movq	%rax, 0x28(%rsp)
0000000000377344	movaps	-0x60(%rbp), %xmm0
0000000000377348	movups	%xmm0, 0x18(%rsp)
000000000037734d	movq	-0x30(%rbp), %rax
0000000000377351	movq	%rax, 0x10(%rsp)
0000000000377356	movaps	-0x40(%rbp), %xmm0
000000000037735a	movups	%xmm0, (%rsp)
000000000037735e	leaq	-0x80(%rbp), %rdi
0000000000377362	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377367	movq	0x10(%r12), %rax
000000000037736c	movq	%rax, 0x28(%rsp)
0000000000377371	movups	(%r12), %xmm0
0000000000377376	movups	%xmm0, 0x18(%rsp)
000000000037737b	movq	-0x70(%rbp), %rax
000000000037737f	movq	%rax, 0x10(%rsp)
0000000000377384	movups	-0x80(%rbp), %xmm0
0000000000377388	movups	%xmm0, (%rsp)
000000000037738c	leaq	-0x60(%rbp), %rdi
0000000000377390	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377395	movups	-0xa0(%rbp), %xmm0
000000000037739c	movaps	%xmm0, -0xd0(%rbp)
00000000003773a3	movq	-0x90(%rbp), %rax
00000000003773aa	movq	%rax, -0xc0(%rbp)
00000000003773b1	movq	-0x90(%rbp), %rax
00000000003773b8	movq	%rax, 0x28(%rsp)
00000000003773bd	movups	-0xa0(%rbp), %xmm0
00000000003773c4	movups	%xmm0, 0x18(%rsp)
00000000003773c9	movq	-0x50(%rbp), %rax
00000000003773cd	movq	%rax, 0x10(%rsp)
00000000003773d2	movups	-0x60(%rbp), %xmm0
00000000003773d6	movups	%xmm0, (%rsp)
00000000003773da	leaq	-0x40(%rbp), %rdi
00000000003773de	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
00000000003773e3	movq	0x10(%r12), %rax
00000000003773e8	movq	%rax, 0x28(%rsp)
00000000003773ed	movups	(%r12), %xmm0
00000000003773f2	movups	%xmm0, 0x18(%rsp)
00000000003773f7	movq	-0x30(%rbp), %rax
00000000003773fb	movq	%rax, 0x10(%rsp)
0000000000377400	movups	-0x40(%rbp), %xmm0
0000000000377404	movups	%xmm0, (%rsp)
0000000000377408	leaq	-0xb8(%rbp), %rdi
000000000037740f	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377414	movq	%rbx, %r14
0000000000377417	jmp	0x37759d
000000000037741c	leaq	0x18(%r13), %rax
0000000000377420	leaq	0x1c(%r12), %r15
0000000000377425	leaq	0x34(%r12), %r14
000000000037742a	movq	0x10(%r13), %rcx
000000000037742e	movq	%rcx, -0x30(%rbp)
0000000000377432	movups	(%r13), %xmm0
0000000000377437	movaps	%xmm0, -0x40(%rbp)
000000000037743b	movq	0x10(%rax), %rcx
000000000037743f	movq	%rcx, -0x50(%rbp)
0000000000377443	movups	(%rax), %xmm0
0000000000377446	movaps	%xmm0, -0x60(%rbp)
000000000037744a	movq	-0x50(%rbp), %rax
000000000037744e	movq	%rax, 0x28(%rsp)
0000000000377453	movaps	-0x60(%rbp), %xmm0
0000000000377457	movups	%xmm0, 0x18(%rsp)
000000000037745c	movq	-0x30(%rbp), %rax
0000000000377460	movq	%rax, 0x10(%rsp)
0000000000377465	movaps	-0x40(%rbp), %xmm0
0000000000377469	movups	%xmm0, (%rsp)
000000000037746d	leaq	-0xa0(%rbp), %rdi
0000000000377474	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377479	movq	0x10(%r15), %rax
000000000037747d	movq	%rax, -0x30(%rbp)
0000000000377481	movups	(%r15), %xmm0
0000000000377485	movaps	%xmm0, -0x40(%rbp)
0000000000377489	movq	0x10(%r14), %rax
000000000037748d	movq	%rax, -0x50(%rbp)
0000000000377491	movups	(%r14), %xmm0
0000000000377495	movaps	%xmm0, -0x60(%rbp)
0000000000377499	movq	-0x50(%rbp), %rax
000000000037749d	movq	%rax, 0x28(%rsp)
00000000003774a2	movaps	-0x60(%rbp), %xmm0
00000000003774a6	movups	%xmm0, 0x18(%rsp)
00000000003774ab	movq	-0x30(%rbp), %rax
00000000003774af	movq	%rax, 0x10(%rsp)
00000000003774b4	movaps	-0x40(%rbp), %xmm0
00000000003774b8	movups	%xmm0, (%rsp)
00000000003774bc	leaq	-0x80(%rbp), %rdi
00000000003774c0	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
00000000003774c5	leaq	0x10(%rbp), %r14
00000000003774c9	movq	0x10(%r14), %rax
00000000003774cd	movq	%rax, 0x28(%rsp)
00000000003774d2	movups	(%r14), %xmm0
00000000003774d6	movups	%xmm0, 0x18(%rsp)
00000000003774db	movq	-0x70(%rbp), %rax
00000000003774df	movq	%rax, 0x10(%rsp)
00000000003774e4	movups	-0x80(%rbp), %xmm0
00000000003774e8	movups	%xmm0, (%rsp)
00000000003774ec	leaq	-0x60(%rbp), %rdi
00000000003774f0	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
00000000003774f5	movups	-0xa0(%rbp), %xmm0
00000000003774fc	movaps	%xmm0, -0xd0(%rbp)
0000000000377503	movq	-0x90(%rbp), %rax
000000000037750a	movq	%rax, -0xc0(%rbp)
0000000000377511	movq	-0x90(%rbp), %rax
0000000000377518	movq	%rax, 0x28(%rsp)
000000000037751d	movups	-0xa0(%rbp), %xmm0
0000000000377524	movups	%xmm0, 0x18(%rsp)
0000000000377529	movq	-0x50(%rbp), %rax
000000000037752d	movq	%rax, 0x10(%rsp)
0000000000377532	movups	-0x60(%rbp), %xmm0
0000000000377536	movups	%xmm0, (%rsp)
000000000037753a	leaq	-0x40(%rbp), %rdi
000000000037753e	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000377543	movq	0x10(%r14), %rax
0000000000377547	movq	%rax, 0x28(%rsp)
000000000037754c	movups	(%r14), %xmm0
0000000000377550	movups	%xmm0, 0x18(%rsp)
0000000000377555	movq	-0x30(%rbp), %rax
0000000000377559	movq	%rax, 0x10(%rsp)
000000000037755e	movups	-0x40(%rbp), %xmm0
0000000000377562	movups	%xmm0, (%rsp)
0000000000377566	leaq	-0xb8(%rbp), %rdi
000000000037756d	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000377572	movq	0x8(%r12), %rax
0000000000377577	testq	%rax, %rax
000000000037757a	je	0x377590
000000000037757c	nopl	(%rax)
0000000000377580	movq	%rax, %r14
0000000000377583	movq	(%rax), %rax
0000000000377586	testq	%rax, %rax
0000000000377589	jne	0x377580
000000000037758b	jmp	0x37759d
000000000037758d	nopl	(%rax)
0000000000377590	movq	0x10(%r12), %r14
0000000000377595	cmpq	(%r14), %r12
0000000000377598	movq	%r14, %r12
000000000037759b	jne	0x377590
000000000037759d	cmpq	%r14, %rbx
00000000003775a0	movq	-0x128(%rbp), %r12
00000000003775a7	jne	0x3777a6
00000000003775ad	leaq	-0xe8(%rbp), %rcx
00000000003775b4	movq	0x10(%rcx), %rax
00000000003775b8	movq	%rax, -0x30(%rbp)
00000000003775bc	movups	(%rcx), %xmm0
00000000003775bf	movaps	%xmm0, -0x40(%rbp)
00000000003775c3	movq	0x4acf46(%rip), %rbx            ## literal pool symbol address: _kCMTimeZero
00000000003775ca	movq	0x10(%rbx), %rax
00000000003775ce	movq	%rax, -0x50(%rbp)
00000000003775d2	movups	(%rbx), %xmm0
00000000003775d5	movaps	%xmm0, -0x60(%rbp)
00000000003775d9	movq	-0x50(%rbp), %rax
00000000003775dd	movq	%rax, 0x28(%rsp)
00000000003775e2	movaps	-0x60(%rbp), %xmm0
00000000003775e6	movups	%xmm0, 0x18(%rsp)
00000000003775eb	movq	-0x30(%rbp), %rax
00000000003775ef	movq	%rax, 0x10(%rsp)
00000000003775f4	movaps	-0x40(%rbp), %xmm0
00000000003775f8	movups	%xmm0, (%rsp)
00000000003775fc	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
0000000000377601	testl	%eax, %eax
0000000000377603	jle	0x37768e
0000000000377609	leaq	-0x40(%rbp), %rsi
000000000037760d	leaq	-0x100(%rbp), %rdx
0000000000377614	movq	%r12, %rdi
0000000000377617	callq	__ZNSt3__16__treeI11PCTimeRangeNS_4lessIS1_EENS_9allocatorIS1_EEE12__find_equalIS1_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISB_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<PCTimeRange, std::__1::less<PCTimeRange>, std::__1::allocator<PCTimeRange>>::__find_equal<PCTimeRange>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, PCTimeRange const&)
000000000037761c	cmpq	$0x0, (%rax)
0000000000377620	jne	0x37768e
0000000000377622	movq	%rax, %r14
0000000000377625	movl	$0x50, %edi
000000000037762a	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000037762f	movq	-0xf0(%rbp), %rcx
0000000000377636	movq	%rcx, 0x2c(%rax)
000000000037763a	movaps	-0x100(%rbp), %xmm0
0000000000377641	movups	%xmm0, 0x1c(%rax)
0000000000377645	leaq	-0xe8(%rbp), %rcx
000000000037764c	movups	(%rcx), %xmm0
000000000037764f	movups	%xmm0, 0x34(%rax)
0000000000377653	movq	0x10(%rcx), %rcx
0000000000377657	movq	%rcx, 0x44(%rax)
000000000037765b	movq	-0x40(%rbp), %rcx
000000000037765f	xorps	%xmm0, %xmm0
0000000000377662	movups	%xmm0, (%rax)
0000000000377665	movq	%rcx, 0x10(%rax)
0000000000377669	movq	%rax, (%r14)
000000000037766c	movq	(%r12), %rcx
0000000000377670	movq	(%rcx), %rcx
0000000000377673	testq	%rcx, %rcx
0000000000377676	je	0x37767c
0000000000377678	movq	%rcx, (%r12)
000000000037767c	movq	0x8(%r12), %rdi
0000000000377681	movq	%rax, %rsi
0000000000377684	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000377689	incq	0x10(%r12)
000000000037768e	leaq	-0xb8(%rbp), %rcx
0000000000377695	movq	0x10(%rcx), %rax
0000000000377699	movq	%rax, -0x30(%rbp)
000000000037769d	movups	(%rcx), %xmm0
00000000003776a0	movaps	%xmm0, -0x40(%rbp)
00000000003776a4	movq	0x10(%rbx), %rax
00000000003776a8	movq	%rax, -0x50(%rbp)
00000000003776ac	movups	(%rbx), %xmm0
00000000003776af	movaps	%xmm0, -0x60(%rbp)
00000000003776b3	movq	-0x50(%rbp), %rax
00000000003776b7	movq	%rax, 0x28(%rsp)
00000000003776bc	movaps	-0x60(%rbp), %xmm0
00000000003776c0	movups	%xmm0, 0x18(%rsp)
00000000003776c5	movq	-0x30(%rbp), %rax
00000000003776c9	movq	%rax, 0x10(%rsp)
00000000003776ce	movaps	-0x40(%rbp), %xmm0
00000000003776d2	movups	%xmm0, (%rsp)
00000000003776d6	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000003776db	testl	%eax, %eax
00000000003776dd	jle	0x377768
00000000003776e3	leaq	-0x40(%rbp), %rsi
00000000003776e7	leaq	-0xd0(%rbp), %rdx
00000000003776ee	movq	%r12, %rdi
00000000003776f1	callq	__ZNSt3__16__treeI11PCTimeRangeNS_4lessIS1_EENS_9allocatorIS1_EEE12__find_equalIS1_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISB_EERKT_ ## std::__1::__tree_node_base<void*>*& std::__1::__tree<PCTimeRange, std::__1::less<PCTimeRange>, std::__1::allocator<PCTimeRange>>::__find_equal<PCTimeRange>(std::__1::__tree_end_node<std::__1::__tree_node_base<void*>*>*&, PCTimeRange const&)
00000000003776f6	cmpq	$0x0, (%rax)
00000000003776fa	jne	0x377768
00000000003776fc	movq	%rax, %r14
00000000003776ff	movl	$0x50, %edi
0000000000377704	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000377709	movq	-0xc0(%rbp), %rcx
0000000000377710	movq	%rcx, 0x2c(%rax)
0000000000377714	movaps	-0xd0(%rbp), %xmm0
000000000037771b	movups	%xmm0, 0x1c(%rax)
000000000037771f	leaq	-0xb8(%rbp), %rcx
0000000000377726	movups	(%rcx), %xmm0
0000000000377729	movups	%xmm0, 0x34(%rax)
000000000037772d	movq	0x10(%rcx), %rcx
0000000000377731	movq	%rcx, 0x44(%rax)
0000000000377735	movq	-0x40(%rbp), %rcx
0000000000377739	xorps	%xmm0, %xmm0
000000000037773c	movups	%xmm0, (%rax)
000000000037773f	movq	%rcx, 0x10(%rax)
0000000000377743	movq	%rax, (%r14)
0000000000377746	movq	(%r12), %rcx
000000000037774a	movq	(%rcx), %rcx
000000000037774d	testq	%rcx, %rcx
0000000000377750	je	0x377756
0000000000377752	movq	%rcx, (%r12)
0000000000377756	movq	0x8(%r12), %rdi
000000000037775b	movq	%rax, %rsi
000000000037775e	callq	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_balance_after_insert[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000377763	incq	0x10(%r12)
0000000000377768	movb	$0x1, %al
000000000037776a	addq	$0x138, %rsp                    ## imm = 0x138
0000000000377771	popq	%rbx
0000000000377772	popq	%r12
0000000000377774	popq	%r13
0000000000377776	popq	%r14
0000000000377778	popq	%r15
000000000037777a	popq	%rbp
000000000037777b	retq
000000000037777c	nopl	(%rax)
0000000000377780	decq	0x10(%r12)
0000000000377785	movq	0x8(%r12), %rdi
000000000037778a	movq	%rbx, %rsi
000000000037778d	callq	__ZNSt3__113__tree_removeB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_ ## void std::__1::__tree_remove[abi:nqe210106]<std::__1::__tree_node_base<void*>*>(std::__1::__tree_node_base<void*>*, std::__1::__tree_node_base<void*>*)
0000000000377792	movq	%rbx, %rdi
0000000000377795	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000037779a	movq	%r15, %rbx
000000000037779d	cmpq	%r14, %r15
00000000003777a0	je	0x3775ad
00000000003777a6	movq	0x8(%rbx), %rax
00000000003777aa	movq	%rbx, %rcx
00000000003777ad	testq	%rax, %rax
00000000003777b0	je	0x3777d0
00000000003777b2	nopw	%cs:(%rax,%rax)
00000000003777c0	movq	%rax, %r15
00000000003777c3	movq	(%rax), %rax
00000000003777c6	testq	%rax, %rax
00000000003777c9	jne	0x3777c0
00000000003777cb	jmp	0x3777dc
00000000003777cd	nopl	(%rax)
00000000003777d0	movq	0x10(%rcx), %r15
00000000003777d4	cmpq	(%r15), %rcx
00000000003777d7	movq	%r15, %rcx
00000000003777da	jne	0x3777d0
00000000003777dc	cmpq	%rbx, (%r12)
00000000003777e0	jne	0x377780
00000000003777e2	movq	%r15, (%r12)
00000000003777e6	jmp	0x377780
00000000003777e8	nopl	(%rax,%rax)
