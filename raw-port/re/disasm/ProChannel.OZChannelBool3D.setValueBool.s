__ZN15OZChannelBool3D8setValueERK6CMTimebbb:
00000000000537c6	pushq	%rbp
00000000000537c7	movq	%rsp, %rbp
00000000000537ca	pushq	%r15
00000000000537cc	pushq	%r14
00000000000537ce	pushq	%r12
00000000000537d0	pushq	%rbx
00000000000537d1	movl	%r8d, %ebx
00000000000537d4	movl	%ecx, %r14d
00000000000537d7	movq	%rsi, %r15
00000000000537da	movq	%rdi, %r12
00000000000537dd	addq	$0x88, %rdi
00000000000537e4	cvtsi2sd	%edx, %xmm0
00000000000537e8	xorl	%edx, %edx
00000000000537ea	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
00000000000537ef	leaq	0x120(%r12), %rdi
00000000000537f7	xorps	%xmm0, %xmm0
00000000000537fa	cvtsi2sd	%r14d, %xmm0
00000000000537ff	movq	%r15, %rsi
0000000000053802	xorl	%edx, %edx
0000000000053804	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000053809	addq	$0x1b8, %r12                    ## imm = 0x1B8
0000000000053810	xorps	%xmm0, %xmm0
0000000000053813	cvtsi2sd	%ebx, %xmm0
0000000000053817	movq	%r12, %rdi
000000000005381a	movq	%r15, %rsi
000000000005381d	xorl	%edx, %edx
000000000005381f	popq	%rbx
0000000000053820	popq	%r12
0000000000053822	popq	%r14
0000000000053824	popq	%r15
0000000000053826	popq	%rbp
0000000000053827	jmp	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
