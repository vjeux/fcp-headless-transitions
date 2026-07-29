__ZN17OZImageMaskRender9getHeliumER7LiAgent:
00000000004702c0	pushq	%rbp
00000000004702c1	movq	%rsp, %rbp
00000000004702c4	pushq	%r15
00000000004702c6	pushq	%r14
00000000004702c8	pushq	%r12
00000000004702ca	pushq	%rbx
00000000004702cb	subq	$0x20, %rsp
00000000004702cf	movq	%rdx, %r15
00000000004702d2	movq	%rsi, %r14
00000000004702d5	movq	%rdi, %rbx
00000000004702d8	movq	0x5d8(%rsi), %rdi
00000000004702df	callq	__ZNK11OZImageMask19isUsingSegmentationEv ## OZImageMask::isUsingSegmentation() const
00000000004702e4	testb	%al, %al
00000000004702e6	je	0x470321
00000000004702e8	movq	0x3b3571(%rip), %rdi            ## literal pool symbol address: _kPCNCLC_sRGB
00000000004702ef	callq	0x6dd18e                        ## symbol stub for: __Z19PCGetNCLCColorSpaceRK10PCNCLCCode
00000000004702f4	leaq	-0x40(%rbp), %r12
00000000004702f8	movq	%r12, %rdi
00000000004702fb	movq	%rax, %rsi
00000000004702fe	movl	$0x1, %edx
0000000000470303	callq	0x6dd284                        ## symbol stub for: __Z28FxMakeLegacyColorDescriptionP12CGColorSpaceb
0000000000470308	movq	%r15, %rdi
000000000047030b	movq	%r12, %rsi
000000000047030e	callq	0x6deb9e                        ## symbol stub for: __ZN7LiAgent28setRequestedColorDescriptionERK18FxColorDescription
0000000000470313	movq	-0x40(%rbp), %rdi
0000000000470317	testq	%rdi, %rdi
000000000047031a	je	0x470321
000000000047031c	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000470321	cmpb	$0x0, 0x610(%r14)
0000000000470329	je	0x47037a
000000000047032b	movl	$0x988, %edi                    ## imm = 0x988
0000000000470330	addq	0x5d8(%r14), %rdi
0000000000470337	movq	0x3b41d2(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000047033e	xorps	%xmm0, %xmm0
0000000000470341	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000470346	movl	%eax, %r12d
0000000000470349	movq	0x5d8(%r14), %rdi
0000000000470350	movq	(%rdi), %rax
0000000000470353	callq	*0x518(%rax)
0000000000470359	movq	$0x0, (%rbx)
0000000000470360	testl	%r12d, %r12d
0000000000470363	jne	0x470391
0000000000470365	testb	%al, %al
0000000000470367	je	0x470391
0000000000470369	leaq	-0x40(%rbp), %rdi
000000000047036d	movq	%r14, %rsi
0000000000470370	movq	%r15, %rdx
0000000000470373	callq	__ZN17OZImageMaskRender19getStencilClampNodeER7LiAgent ## OZImageMaskRender::getStencilClampNode(LiAgent&)
0000000000470378	jmp	0x4703c0
000000000047037a	movq	0x5e0(%r14), %rdx
0000000000470381	movq	%rbx, %rdi
0000000000470384	movq	%r15, %rsi
0000000000470387	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
000000000047038c	jmp	0x470498
0000000000470391	testl	%r12d, %r12d
0000000000470394	je	0x4703b1
0000000000470396	cmpq	$0x0, 0x5d0(%r14)
000000000047039e	je	0x4703b1
00000000004703a0	leaq	-0x40(%rbp), %rdi
00000000004703a4	movq	%r14, %rsi
00000000004703a7	movq	%r15, %rdx
00000000004703aa	callq	__ZN17OZImageMaskRender11getWrapNodeER7LiAgent ## OZImageMaskRender::getWrapNode(LiAgent&)
00000000004703af	jmp	0x4703c0
00000000004703b1	leaq	-0x40(%rbp), %rdi
00000000004703b5	movq	%r14, %rsi
00000000004703b8	movq	%r15, %rdx
00000000004703bb	callq	__ZN17OZImageMaskRender12getClampNodeER7LiAgent ## OZImageMaskRender::getClampNode(LiAgent&)
00000000004703c0	movq	-0x40(%rbp), %r15
00000000004703c4	testq	%r15, %r15
00000000004703c7	je	0x4703cc
00000000004703c9	movq	%r15, (%rbx)
00000000004703cc	movq	0x5d8(%r14), %rdi
00000000004703d3	callq	__ZNK11OZImageMask19isUsingSegmentationEv ## OZImageMask::isUsingSegmentation() const
00000000004703d8	testb	%al, %al
00000000004703da	je	0x470498
00000000004703e0	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000004703e5	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
00000000004703ea	movq	%rax, %r14
00000000004703ed	movq	%rax, %rdi
00000000004703f0	callq	0x6dd7b8                        ## symbol stub for: __ZN13HGColorMatrixC1Ev
00000000004703f5	movq	(%r14), %rax
00000000004703f8	movq	%r14, %rdi
00000000004703fb	xorl	%esi, %esi
00000000004703fd	movq	%r15, %rdx
0000000000470400	callq	*0x78(%rax)
0000000000470403	movq	(%r14), %rax
0000000000470406	movss	0x296b42(%rip), %xmm0
000000000047040e	xorps	%xmm1, %xmm1
0000000000470411	xorps	%xmm2, %xmm2
0000000000470414	movq	%r14, %rdi
0000000000470417	xorl	%esi, %esi
0000000000470419	movaps	%xmm0, %xmm3
000000000047041c	callq	*0x60(%rax)
000000000047041f	movq	(%r14), %rax
0000000000470422	movss	0x296b26(%rip), %xmm1
000000000047042a	xorps	%xmm0, %xmm0
000000000047042d	xorps	%xmm2, %xmm2
0000000000470430	xorps	%xmm3, %xmm3
0000000000470433	movq	%r14, %rdi
0000000000470436	movl	$0x1, %esi
000000000047043b	callq	*0x60(%rax)
000000000047043e	movq	(%r14), %rax
0000000000470441	movss	0x296b07(%rip), %xmm2
0000000000470449	xorps	%xmm0, %xmm0
000000000047044c	xorps	%xmm1, %xmm1
000000000047044f	xorps	%xmm3, %xmm3
0000000000470452	movq	%r14, %rdi
0000000000470455	movl	$0x2, %esi
000000000047045a	callq	*0x60(%rax)
000000000047045d	movq	(%r14), %rax
0000000000470460	xorps	%xmm0, %xmm0
0000000000470463	xorps	%xmm1, %xmm1
0000000000470466	xorps	%xmm2, %xmm2
0000000000470469	xorps	%xmm3, %xmm3
000000000047046c	movq	%r14, %rdi
000000000047046f	movl	$0x3, %esi
0000000000470474	callq	*0x60(%rax)
0000000000470477	movq	(%rbx), %rdi
000000000047047a	cmpq	%r14, %rdi
000000000047047d	je	0x47048f
000000000047047f	testq	%rdi, %rdi
0000000000470482	je	0x47048a
0000000000470484	movq	(%rdi), %rax
0000000000470487	callq	*0x18(%rax)
000000000047048a	movq	%r14, (%rbx)
000000000047048d	jmp	0x470498
000000000047048f	movq	(%r14), %rax
0000000000470492	movq	%r14, %rdi
0000000000470495	callq	*0x18(%rax)
0000000000470498	movq	%rbx, %rax
000000000047049b	addq	$0x20, %rsp
000000000047049f	popq	%rbx
00000000004704a0	popq	%r12
00000000004704a2	popq	%r14
00000000004704a4	popq	%r15
00000000004704a6	popq	%rbp
00000000004704a7	retq
00000000004704a8	movq	%rax, %rdi
00000000004704ab	callq	___clang_call_terminate
00000000004704b0	movq	%rax, %r15
00000000004704b3	movq	(%r14), %rax
00000000004704b6	movq	%r14, %rdi
00000000004704b9	callq	*0x18(%rax)
00000000004704bc	jmp	0x47051e
00000000004704be	movq	%rax, %rdi
00000000004704c1	callq	___clang_call_terminate
00000000004704c6	jmp	0x4704f9
00000000004704c8	jmp	0x4704f9
00000000004704ca	movq	%rax, %r15
00000000004704cd	movq	(%r14), %rax
00000000004704d0	movq	%r14, %rdi
00000000004704d3	callq	*0x18(%rax)
00000000004704d6	jmp	0x47051e
00000000004704d8	movq	%rax, %rdi
00000000004704db	callq	___clang_call_terminate
00000000004704e0	movq	%rax, %r15
00000000004704e3	movq	%r14, %rdi
00000000004704e6	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
00000000004704eb	jmp	0x47051e
00000000004704ed	jmp	0x4704f9
00000000004704ef	jmp	0x4704f9
00000000004704f1	movq	%rax, %rdi
00000000004704f4	callq	___clang_call_terminate
00000000004704f9	movq	%rax, %r15
00000000004704fc	jmp	0x47051e
00000000004704fe	movq	%rax, %r15
0000000000470501	leaq	-0x40(%rbp), %rdi
0000000000470505	callq	__ZN18FxColorDescriptionD1Ev    ## FxColorDescription::~FxColorDescription()
000000000047050a	movq	%r15, %rdi
000000000047050d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000470512	movq	%rax, %r15
0000000000470515	movq	(%r14), %rax
0000000000470518	movq	%r14, %rdi
000000000047051b	callq	*0x18(%rax)
000000000047051e	movq	(%rbx), %rdi
0000000000470521	testq	%rdi, %rdi
0000000000470524	je	0x47052c
0000000000470526	movq	(%rdi), %rax
0000000000470529	callq	*0x18(%rax)
000000000047052c	movq	%r15, %rdi
000000000047052f	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000470534	movq	%rax, %rdi
0000000000470537	callq	___clang_call_terminate
000000000047053c	movq	%rax, %rdi
000000000047053f	callq	___clang_call_terminate
0000000000470544	nopw	%cs:(%rax,%rax)
