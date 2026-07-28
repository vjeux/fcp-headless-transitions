__ZN20OZImageNodeRender3609getHeliumER7LiAgent:
000000000041de20	pushq	%rbp
000000000041de21	movq	%rsp, %rbp
000000000041de24	pushq	%r15
000000000041de26	pushq	%r14
000000000041de28	pushq	%r13
000000000041de2a	pushq	%r12
000000000041de2c	pushq	%rbx
000000000041de2d	subq	$0x178, %rsp                    ## imm = 0x178
000000000041de34	movq	%rdx, %r14
000000000041de37	movq	%rsi, %r12
000000000041de3a	movq	%rdi, -0x38(%rbp)
000000000041de3e	movq	0x30(%rdx), %rsi
000000000041de42	movq	(%r12), %rax
000000000041de46	movq	%r12, %rdi
000000000041de49	callq	*0x38(%rax)
000000000041de4c	cmpl	$0x6, %eax
000000000041de4f	jne	0x41de59
000000000041de51	movl	$0x1, 0x20(%r14)
000000000041de59	leaq	0x18(%r12), %r15
000000000041de5e	movl	$0xa0, %edi
000000000041de63	addq	0x30(%r14), %rdi
000000000041de67	callq	0x6df666                        ## symbol stub for: __ZNK18FxColorDescription15getCGColorSpaceEv
000000000041de6c	movq	%r15, %rdi
000000000041de6f	movq	%rax, %rsi
000000000041de72	callq	__ZN14OZRenderParams20setWorkingColorSpaceEP12CGColorSpace ## OZRenderParams::setWorkingColorSpace(CGColorSpace*)
000000000041de77	movq	0x30(%r14), %rax
000000000041de7b	movss	0xc0(%rax), %xmm0
000000000041de83	movq	%r15, %rdi
000000000041de86	callq	__ZN14OZRenderParams16setBlendingGammaEf ## OZRenderParams::setBlendingGamma(float)
000000000041de8b	movss	0x2e90bd(%rip), %xmm0
000000000041de93	movaps	%xmm0, -0x1a0(%rbp)
000000000041de9a	movaps	%xmm0, -0x190(%rbp)
000000000041dea1	movsd	0x2ef8f7(%rip), %xmm1
000000000041dea9	movsd	%xmm1, -0x180(%rbp)
000000000041deb1	movl	$0x42340000, -0x178(%rbp)       ## imm = 0x42340000
000000000041debb	movb	$0x0, -0x174(%rbp)
000000000041dec2	xorps	%xmm1, %xmm1
000000000041dec5	movups	%xmm1, -0x158(%rbp)
000000000041decc	movb	$0x0, -0x148(%rbp)
000000000041ded3	movaps	0x2ef716(%rip), %xmm1
000000000041deda	movups	%xmm1, -0x144(%rbp)
000000000041dee1	movapd	0x2ef717(%rip), %xmm2
000000000041dee9	movupd	%xmm2, -0x134(%rbp)
000000000041def1	movups	%xmm1, -0x124(%rbp)
000000000041def8	movupd	%xmm2, -0x114(%rbp)
000000000041df00	movq	0x30(%r14), %rax
000000000041df04	movq	(%rax), %rbx
000000000041df07	testq	%rbx, %rbx
000000000041df0a	je	0x41df9e
000000000041df10	movq	(%rbx), %rax
000000000041df13	movq	%rbx, %rdi
000000000041df16	callq	*0x1f8(%rax)
000000000041df1c	cvtsd2ss	%xmm0, %xmm0
000000000041df20	movss	%xmm0, -0x17c(%rbp)
000000000041df28	movq	(%rbx), %rax
000000000041df2b	leaq	-0x100(%rbp), %rdi
000000000041df32	movq	%rbx, %rsi
000000000041df35	callq	*0x10(%rax)
000000000041df38	movapd	-0x100(%rbp), %xmm0
000000000041df40	movapd	%xmm0, %xmm1
000000000041df44	movhpd	-0xe0(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
000000000041df4c	movlpd	-0xc0(%rbp), %xmm0              ## xmm0 = mem[0],xmm0[1]
000000000041df54	cvtpd2ps	%xmm0, %xmm0
000000000041df58	cvtpd2ps	%xmm1, %xmm1
000000000041df5c	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
000000000041df60	movapd	%xmm1, -0x1a0(%rbp)
000000000041df68	movupd	-0xd8(%rbp), %xmm0
000000000041df70	movapd	%xmm0, %xmm1
000000000041df74	movhpd	-0xb8(%rbp), %xmm1              ## xmm1 = xmm1[0],mem[0]
000000000041df7c	movlpd	-0xf0(%rbp), %xmm0              ## xmm0 = mem[0],xmm0[1]
000000000041df84	cvtpd2ps	%xmm0, %xmm2
000000000041df88	cvtpd2ps	%xmm1, %xmm0
000000000041df8c	unpcklpd	%xmm2, %xmm0                    ## xmm0 = xmm0[0],xmm2[0]
000000000041df90	movsd	-0xb0(%rbp), %xmm1
000000000041df98	cvtsd2ss	%xmm1, %xmm1
000000000041df9c	jmp	0x41dfb7
000000000041df9e	movl	$0x42b40000, -0x17c(%rbp)       ## imm = 0x42B40000
000000000041dfa8	movaps	%xmm0, -0x1a0(%rbp)
000000000041dfaf	movss	0x2e8f99(%rip), %xmm1
000000000041dfb7	movapd	%xmm0, -0x190(%rbp)
000000000041dfbf	movss	%xmm1, -0x180(%rbp)
000000000041dfc7	xorpd	%xmm0, %xmm0
000000000041dfcb	movapd	%xmm0, -0x80(%rbp)
000000000041dfd0	movaps	0x2e73e9(%rip), %xmm0
000000000041dfd7	movaps	%xmm0, -0x70(%rbp)
000000000041dfdb	movq	0x10(%r12), %rdi
000000000041dfe0	movq	0x1978(%rdi), %rax
000000000041dfe7	addq	$0x1978, %rdi                   ## imm = 0x1978
000000000041dfee	leaq	-0x80(%rbp), %rsi
000000000041dff2	movq	%r15, %rdx
000000000041dff5	callq	*0x20(%rax)
000000000041dff8	movq	0x10(%r12), %rdi
000000000041dffd	testq	%rdi, %rdi
000000000041e000	je	0x41e02d
000000000041e002	leaq	__ZTI9OZElement(%rip), %rsi     ## typeinfo for OZElement
000000000041e009	leaq	__ZTI14OZImageElement(%rip), %rdx ## typeinfo for OZImageElement
000000000041e010	xorl	%ecx, %ecx
000000000041e012	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000041e017	testq	%rax, %rax
000000000041e01a	je	0x41e02d
000000000041e01c	leaq	-0x80(%rbp), %rsi
000000000041e020	movq	%rax, %rdi
000000000041e023	movq	%r15, %rdx
000000000041e026	xorl	%ecx, %ecx
000000000041e028	callq	__ZN14OZImageElement16getFootageBoundsEP6PCRectIdERK14OZRenderParamsb ## OZImageElement::getFootageBounds(PCRect<double>*, OZRenderParams const&, bool)
000000000041e02d	cvttpd2dq	-0x70(%rbp), %xmm0
000000000041e032	movlpd	%xmm0, -0x158(%rbp)
000000000041e03a	movq	0x15c(%r12), %rax
000000000041e042	movq	%rax, -0x150(%rbp)
000000000041e049	movl	$0x240, %edi                    ## imm = 0x240
000000000041e04e	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
000000000041e053	movq	%rax, %r13
000000000041e056	movq	%rax, %rdi
000000000041e059	callq	0x6de1ea                        ## symbol stub for: __ZN17HGEquirectProjectC1Ev
000000000041e05e	leaq	-0x1a0(%rbp), %rsi
000000000041e065	movq	%r13, %rdi
000000000041e068	callq	0x6de1e4                        ## symbol stub for: __ZN17HGEquirectProject9setParamsERK23HGEquirectProjectParams
000000000041e06d	movq	%r14, %rdi
000000000041e070	callq	0x6df93c                        ## symbol stub for: __ZNK7LiAgent28getRequestedColorDescriptionEv
000000000041e075	movq	%rax, %rbx
000000000041e078	movq	(%rax), %rdi
000000000041e07b	movq	%rdi, -0x58(%rbp)
000000000041e07f	testq	%rdi, %rdi
000000000041e082	je	0x41e089
000000000041e084	callq	0x6dda94                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE6retainES1_
000000000041e089	movl	0x10(%rbx), %eax
000000000041e08c	movl	%eax, -0x48(%rbp)
000000000041e08f	movq	0x8(%rbx), %rax
000000000041e093	movq	%rax, -0x50(%rbp)
000000000041e097	movzbl	0x18(%rbx), %eax
000000000041e09b	movb	%al, -0x40(%rbp)
000000000041e09e	movq	0xa0(%r14), %rax
000000000041e0a5	movups	0x70(%rax), %xmm0
000000000041e0a9	movaps	%xmm0, -0x90(%rbp)
000000000041e0b0	movups	0x60(%rax), %xmm0
000000000041e0b4	movaps	%xmm0, -0xa0(%rbp)
000000000041e0bb	movups	0x50(%rax), %xmm0
000000000041e0bf	movaps	%xmm0, -0xb0(%rbp)
000000000041e0c6	movups	0x40(%rax), %xmm0
000000000041e0ca	movaps	%xmm0, -0xc0(%rbp)
000000000041e0d1	movupd	(%rax), %xmm0
000000000041e0d5	movups	0x10(%rax), %xmm1
000000000041e0d9	movupd	0x20(%rax), %xmm2
000000000041e0de	movups	0x30(%rax), %xmm3
000000000041e0e2	movaps	%xmm3, -0xd0(%rbp)
000000000041e0e9	movapd	%xmm2, -0xe0(%rbp)
000000000041e0f1	movaps	%xmm1, -0xf0(%rbp)
000000000041e0f8	movapd	%xmm0, -0x100(%rbp)
000000000041e100	movq	0x10(%r12), %rbx
000000000041e105	movq	%r14, %rdi
000000000041e108	callq	0x6df8fa                        ## symbol stub for: __ZNK7LiAgent17getHeliumRendererEv
000000000041e10d	movq	0x1978(%rbx), %r10
000000000041e114	addq	$0x1978, %rbx                   ## imm = 0x1978
000000000041e11b	leaq	-0x30(%rbp), %rdi
000000000041e11f	leaq	-0x58(%rbp), %r8
000000000041e123	leaq	-0x100(%rbp), %r9
000000000041e12a	movq	%rbx, %rsi
000000000041e12d	movq	%r15, %rdx
000000000041e130	movq	%rax, %rcx
000000000041e133	callq	*0xc0(%r10)
000000000041e13a	movq	-0x30(%rbp), %rdx
000000000041e13e	movq	(%r13), %rax
000000000041e142	movq	%r13, %rdi
000000000041e145	xorl	%esi, %esi
000000000041e147	callq	*0x78(%rax)
000000000041e14a	leaq	-0x58(%rbp), %rsi
000000000041e14e	movq	%r14, %rdi
000000000041e151	callq	0x6deb92                        ## symbol stub for: __ZN7LiAgent25setActualColorDescriptionERK18FxColorDescription
000000000041e156	movq	-0x38(%rbp), %rbx
000000000041e15a	movq	%r13, (%rbx)
000000000041e15d	movq	-0x30(%rbp), %rdi
000000000041e161	testq	%rdi, %rdi
000000000041e164	je	0x41e16c
000000000041e166	movq	(%rdi), %rax
000000000041e169	callq	*0x18(%rax)
000000000041e16c	movq	-0x58(%rbp), %rdi
000000000041e170	testq	%rdi, %rdi
000000000041e173	je	0x41e17a
000000000041e175	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
000000000041e17a	movq	%rbx, %rax
000000000041e17d	addq	$0x178, %rsp                    ## imm = 0x178
000000000041e184	popq	%rbx
000000000041e185	popq	%r12
000000000041e187	popq	%r13
000000000041e189	popq	%r14
000000000041e18b	popq	%r15
000000000041e18d	popq	%rbp
000000000041e18e	retq
000000000041e18f	movq	%rax, %rdi
000000000041e192	callq	___clang_call_terminate
000000000041e197	movq	%rax, %rdi
000000000041e19a	callq	___clang_call_terminate
000000000041e19f	movq	%rax, %rbx
000000000041e1a2	jmp	0x41e1e4
000000000041e1a4	movq	%rax, %rbx
000000000041e1a7	movq	%r13, %rdi
000000000041e1aa	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
000000000041e1af	movq	%rbx, %rdi
000000000041e1b2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000041e1b7	movq	%rax, %rbx
000000000041e1ba	jmp	0x41e1e4
000000000041e1bc	movq	%rax, %rbx
000000000041e1bf	movq	-0x30(%rbp), %rdi
000000000041e1c3	testq	%rdi, %rdi
000000000041e1c6	je	0x41e1db
000000000041e1c8	movq	(%rdi), %rax
000000000041e1cb	callq	*0x18(%rax)
000000000041e1ce	jmp	0x41e1db
000000000041e1d0	movq	%rax, %rdi
000000000041e1d3	callq	___clang_call_terminate
000000000041e1d8	movq	%rax, %rbx
000000000041e1db	leaq	-0x58(%rbp), %rdi
000000000041e1df	callq	__ZN18FxColorDescriptionD1Ev    ## FxColorDescription::~FxColorDescription()
000000000041e1e4	testq	%r13, %r13
000000000041e1e7	je	0x41e1f3
000000000041e1e9	movq	(%r13), %rax
000000000041e1ed	movq	%r13, %rdi
000000000041e1f0	callq	*0x18(%rax)
000000000041e1f3	movq	%rbx, %rdi
000000000041e1f6	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000041e1fb	movq	%rax, %rdi
000000000041e1fe	callq	___clang_call_terminate
000000000041e203	nopw	%cs:(%rax,%rax)
