__ZN19OZChannelRotation3D23interpolationModeWasSetEv:
0000000000082704	pushq	%rbp
0000000000082705	movq	%rsp, %rbp
0000000000082708	pushq	%r15
000000000008270a	pushq	%r14
000000000008270c	pushq	%r13
000000000008270e	pushq	%r12
0000000000082710	pushq	%rbx
0000000000082711	subq	$0x78, %rsp
0000000000082715	movq	%rdi, %r14
0000000000082718	leaq	0x250(%rdi), %rbx
000000000008271f	movq	0x47d9a(%rip), %r12             ## literal pool symbol address: _kCMTimeZero
0000000000082726	xorps	%xmm0, %xmm0
0000000000082729	movq	%rbx, %rdi
000000000008272c	movq	%r12, %rsi
000000000008272f	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000082734	cmpl	$0x1, %eax
0000000000082737	jne	0x828db
000000000008273d	xorps	%xmm0, %xmm0
0000000000082740	movq	%rbx, -0x68(%rbp)
0000000000082744	movq	%rbx, %rdi
0000000000082747	movq	%r12, %rsi
000000000008274a	movl	$0x1, %edx
000000000008274f	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
0000000000082754	movq	%r14, %rdi
0000000000082757	movl	$0x100000, %esi                 ## imm = 0x100000
000000000008275c	callq	__ZN15OZChannelFolder11setFoldFlagEj ## OZChannelFolder::setFoldFlag(unsigned int)
0000000000082761	leaq	0x120(%r14), %rax
0000000000082768	movq	%rax, -0x38(%rbp)
000000000008276c	leaq	0x88(%r14), %rax
0000000000082773	movq	%rax, -0x48(%rbp)
0000000000082777	leaq	0x1b8(%r14), %rax
000000000008277e	movq	%rax, -0x30(%rbp)
0000000000082782	xorl	%r13d, %r13d
0000000000082785	movq	%r14, -0x70(%rbp)
0000000000082789	movq	-0x48(%rbp), %r15
000000000008278d	testl	%r13d, %r13d
0000000000082790	je	0x827a0
0000000000082792	movq	-0x38(%rbp), %r15
0000000000082796	cmpl	$0x1, %r13d
000000000008279a	je	0x827a0
000000000008279c	movq	-0x30(%rbp), %r15
00000000000827a0	movq	(%r15), %rax
00000000000827a3	movq	%r15, %rdi
00000000000827a6	callq	*0x340(%rax)
00000000000827ac	testl	%eax, %eax
00000000000827ae	je	0x828a2
00000000000827b4	movl	%eax, %ebx
00000000000827b6	leaq	-0x60(%rbp), %rdi
00000000000827ba	movq	%r15, -0x40(%rbp)
00000000000827be	movq	%r15, %rsi
00000000000827c1	xorl	%edx, %edx
00000000000827c3	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
00000000000827c8	movl	%ebx, %eax
00000000000827ca	movq	%rax, -0x78(%rbp)
00000000000827ce	xorl	%r15d, %r15d
00000000000827d1	movq	0x10(%r12), %rax
00000000000827d6	movq	%rax, -0x90(%rbp)
00000000000827dd	movups	(%r12), %xmm0
00000000000827e2	movaps	%xmm0, -0xa0(%rbp)
00000000000827e9	movq	$0x0, -0x80(%rbp)
00000000000827f1	movq	-0x60(%rbp), %rax
00000000000827f5	movq	(%rax,%r15,8), %rsi
00000000000827f9	movq	-0x40(%rbp), %rdi
00000000000827fd	leaq	-0xa0(%rbp), %rbx
0000000000082804	movq	%rbx, %rdx
0000000000082807	leaq	-0x80(%rbp), %rcx
000000000008280b	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000082810	movq	%r14, %rdi
0000000000082813	movq	%rbx, %rsi
0000000000082816	callq	__ZN15OZChannelFolder13addKeypointAtERK6CMTime ## OZChannelFolder::addKeypointAt(CMTime const&)
000000000008281b	xorl	%r12d, %r12d
000000000008281e	cmpl	%r12d, %r13d
0000000000082821	je	0x8286f
0000000000082823	movq	-0x48(%rbp), %rbx
0000000000082827	testl	%r12d, %r12d
000000000008282a	je	0x8283a
000000000008282c	movq	-0x38(%rbp), %rbx
0000000000082830	cmpl	$0x1, %r12d
0000000000082834	je	0x8283a
0000000000082836	movq	-0x30(%rbp), %rbx
000000000008283a	movq	%rbx, %rdi
000000000008283d	leaq	-0xa0(%rbp), %rsi
0000000000082844	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000082849	movq	%rax, %r14
000000000008284c	testq	%rax, %rax
000000000008284f	je	0x8286f
0000000000082851	movq	-0x60(%rbp), %rax
0000000000082855	movq	(%rax,%r15,8), %rsi
0000000000082859	movq	-0x40(%rbp), %rdi
000000000008285d	callq	__ZN9OZChannel24getKeyframeInterpolationEPv ## OZChannel::getKeyframeInterpolation(void*)
0000000000082862	movq	%rbx, %rdi
0000000000082865	movq	%r14, %rsi
0000000000082868	movl	%eax, %edx
000000000008286a	callq	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
000000000008286f	incl	%r12d
0000000000082872	cmpl	$0x3, %r12d
0000000000082876	jne	0x8281e
0000000000082878	incq	%r15
000000000008287b	cmpq	-0x78(%rbp), %r15
000000000008287f	movq	-0x70(%rbp), %r14
0000000000082883	movq	0x47c36(%rip), %r12             ## literal pool symbol address: _kCMTimeZero
000000000008288a	jne	0x827d1
0000000000082890	movq	-0x60(%rbp), %rdi
0000000000082894	testq	%rdi, %rdi
0000000000082897	je	0x828a2
0000000000082899	movq	%rdi, -0x58(%rbp)
000000000008289d	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000828a2	incl	%r13d
00000000000828a5	cmpl	$0x3, %r13d
00000000000828a9	jne	0x82789
00000000000828af	movq	0x47c0a(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000828b6	movsd	0x2cc6a(%rip), %xmm0
00000000000828be	movq	-0x68(%rbp), %rdi
00000000000828c2	movl	$0x1, %edx
00000000000828c7	callq	__ZN9OZChannel11setKeyframeERK6CMTimedb ## OZChannel::setKeyframe(CMTime const&, double, bool)
00000000000828cc	addq	$0x78, %rsp
00000000000828d0	popq	%rbx
00000000000828d1	popq	%r12
00000000000828d3	popq	%r13
00000000000828d5	popq	%r14
00000000000828d7	popq	%r15
00000000000828d9	popq	%rbp
00000000000828da	retq
00000000000828db	movq	%r14, %rdi
00000000000828de	movl	$0x100000, %esi                 ## imm = 0x100000
00000000000828e3	addq	$0x78, %rsp
00000000000828e7	popq	%rbx
00000000000828e8	popq	%r12
00000000000828ea	popq	%r13
00000000000828ec	popq	%r14
00000000000828ee	popq	%r15
00000000000828f0	popq	%rbp
00000000000828f1	jmp	__ZN15OZChannelFolder13resetFoldFlagEj ## OZChannelFolder::resetFoldFlag(unsigned int)
00000000000828f6	jmp	0x828fa
00000000000828f8	jmp	0x828fa
00000000000828fa	movq	%rax, %rbx
00000000000828fd	movq	-0x60(%rbp), %rdi
0000000000082901	testq	%rdi, %rdi
0000000000082904	je	0x8290f
0000000000082906	movq	%rdi, -0x58(%rbp)
000000000008290a	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000008290f	movq	%rbx, %rdi
0000000000082912	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000082917	nop
