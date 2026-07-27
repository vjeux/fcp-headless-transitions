__ZN19OZChannelRotation3D24setKeypointInterpolationEP9OZChannelPvjb:
0000000000081780	pushq	%rbp
0000000000081781	movq	%rsp, %rbp
0000000000081784	pushq	%r15
0000000000081786	pushq	%r14
0000000000081788	pushq	%r13
000000000008178a	pushq	%r12
000000000008178c	pushq	%rbx
000000000008178d	subq	$0x28, %rsp
0000000000081791	movl	%ecx, %ebx
0000000000081793	movq	%rsi, %r15
0000000000081796	movq	%rdi, %r14
0000000000081799	movq	0x48d20(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000817a0	movq	0x10(%rcx), %rsi
00000000000817a4	leaq	-0x40(%rbp), %rax
00000000000817a8	movq	%rsi, 0x10(%rax)
00000000000817ac	movups	(%rcx), %xmm0
00000000000817af	movaps	%xmm0, (%rax)
00000000000817b2	leaq	-0x48(%rbp), %rcx
00000000000817b6	movq	$0x0, (%rcx)
00000000000817bd	movq	%r15, %rdi
00000000000817c0	movq	%rdx, %rsi
00000000000817c3	movq	%rax, %rdx
00000000000817c6	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
00000000000817cb	leaq	0x88(%r14), %r12
00000000000817d2	cmpq	%r12, %r15
00000000000817d5	je	0x817fa
00000000000817d7	leaq	-0x40(%rbp), %rsi
00000000000817db	movq	%r15, %rdi
00000000000817de	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
00000000000817e3	testq	%rax, %rax
00000000000817e6	je	0x817fa
00000000000817e8	movq	%r12, %rdi
00000000000817eb	movq	%rax, %rsi
00000000000817ee	movl	%ebx, %edx
00000000000817f0	callq	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
00000000000817f5	movb	$0x1, %r12b
00000000000817f8	jmp	0x817fd
00000000000817fa	xorl	%r12d, %r12d
00000000000817fd	leaq	0x120(%r14), %r13
0000000000081804	cmpq	%r13, %r15
0000000000081807	je	0x8182a
0000000000081809	leaq	-0x40(%rbp), %rsi
000000000008180d	movq	%r15, %rdi
0000000000081810	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000081815	testq	%rax, %rax
0000000000081818	je	0x8182a
000000000008181a	movq	%r13, %rdi
000000000008181d	movq	%rax, %rsi
0000000000081820	movl	%ebx, %edx
0000000000081822	callq	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
0000000000081827	movb	$0x1, %r12b
000000000008182a	addq	$0x1b8, %r14                    ## imm = 0x1B8
0000000000081831	cmpq	%r14, %r15
0000000000081834	je	0x81857
0000000000081836	leaq	-0x40(%rbp), %rsi
000000000008183a	movq	%r15, %rdi
000000000008183d	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000081842	testq	%rax, %rax
0000000000081845	je	0x81857
0000000000081847	movq	%r14, %rdi
000000000008184a	movq	%rax, %rsi
000000000008184d	movl	%ebx, %edx
000000000008184f	callq	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
0000000000081854	movb	$0x1, %r12b
0000000000081857	movl	%r12d, %eax
000000000008185a	addq	$0x28, %rsp
000000000008185e	popq	%rbx
000000000008185f	popq	%r12
0000000000081861	popq	%r13
0000000000081863	popq	%r14
0000000000081865	popq	%r15
0000000000081867	popq	%rbp
0000000000081868	retq
0000000000081869	nop
