__ZNK21OZChannelColorNoAlpha8getColorERK6CMTimeP7PCColord:
00000000000563c0	pushq	%rbp
00000000000563c1	movq	%rsp, %rbp
00000000000563c4	pushq	%r15
00000000000563c6	pushq	%r14
00000000000563c8	pushq	%rbx
00000000000563c9	subq	$0x18, %rsp
00000000000563cd	movsd	%xmm0, -0x20(%rbp)
00000000000563d2	movq	%rdx, %rbx
00000000000563d5	movq	%rsi, %r15
00000000000563d8	movq	%rdi, %r14
00000000000563db	addq	$0x88, %rdi
00000000000563e2	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000563e7	cvtsd2ss	%xmm0, %xmm0
00000000000563eb	movss	%xmm0, -0x30(%rbp)
00000000000563f0	leaq	0x120(%r14), %rdi
00000000000563f7	movq	%r15, %rsi
00000000000563fa	movsd	-0x20(%rbp), %xmm0
00000000000563ff	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056404	cvtsd2ss	%xmm0, %xmm0
0000000000056408	movss	%xmm0, -0x2c(%rbp)
000000000005640d	leaq	0x1b8(%r14), %rdi
0000000000056414	movq	%r15, %rsi
0000000000056417	movsd	-0x20(%rbp), %xmm0
000000000005641c	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056421	cvtsd2ss	%xmm0, %xmm0
0000000000056425	movss	%xmm0, -0x20(%rbp)
000000000005642a	cmpb	$0x1, 0x3e8(%r14)
0000000000056432	jne	0x56442
0000000000056434	leaq	-0x28(%rbp), %rdi
0000000000056438	movq	%r14, %rsi
000000000005643b	callq	__ZNK21OZChannelColorNoAlpha15getPCColorSpaceEv ## OZChannelColorNoAlpha::getPCColorSpace() const
0000000000056440	jmp	0x5644e
0000000000056442	leaq	-0x28(%rbp), %rdi
0000000000056446	movq	%rbx, %rsi
0000000000056449	callq	0xacd5c                         ## symbol stub for: __ZNK7PCColor13getColorSpaceEv
000000000005644e	movss	0x5a962(%rip), %xmm3
0000000000056456	leaq	-0x28(%rbp), %rsi
000000000005645a	movq	%rbx, %rdi
000000000005645d	movss	-0x30(%rbp), %xmm0
0000000000056462	movss	-0x2c(%rbp), %xmm1
0000000000056467	movss	-0x20(%rbp), %xmm2
000000000005646c	callq	0xacc84                         ## symbol stub for: __ZN7PCColor7setRGBAEffffRK18PCColorSpaceHandle
0000000000056471	leaq	-0x28(%rbp), %rdi
0000000000056475	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
000000000005647a	addq	$0x18, %rsp
000000000005647e	popq	%rbx
000000000005647f	popq	%r14
0000000000056481	popq	%r15
0000000000056483	popq	%rbp
0000000000056484	retq
0000000000056485	movq	%rax, %rbx
0000000000056488	leaq	-0x28(%rbp), %rdi
000000000005648c	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
0000000000056491	movq	%rbx, %rdi
0000000000056494	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000056499	nop
