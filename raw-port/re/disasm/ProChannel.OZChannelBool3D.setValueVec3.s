__ZN15OZChannelBool3D8setValueERK6CMTimeRK9PCVector3IdE:
000000000005382c	pushq	%rbp
000000000005382d	movq	%rsp, %rbp
0000000000053830	pushq	%r15
0000000000053832	pushq	%r14
0000000000053834	pushq	%rbx
0000000000053835	pushq	%rax
0000000000053836	movq	%rdx, %r15
0000000000053839	movq	%rsi, %rbx
000000000005383c	movq	%rdi, %r14
000000000005383f	addq	$0x88, %rdi
0000000000053846	movsd	(%rdx), %xmm0
000000000005384a	andpd	0x5cb3e(%rip), %xmm0
0000000000053852	cmpnltsd	0x5cb55(%rip), %xmm0
000000000005385b	movsd	0x5bcc5(%rip), %xmm1
0000000000053863	andpd	%xmm1, %xmm0
0000000000053867	xorl	%edx, %edx
0000000000053869	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
000000000005386e	leaq	0x120(%r14), %rdi
0000000000053875	movsd	0x8(%r15), %xmm0
000000000005387b	andpd	0x5cb0d(%rip), %xmm0
0000000000053883	cmpnltsd	0x5cb24(%rip), %xmm0
000000000005388c	movsd	0x5bc94(%rip), %xmm1
0000000000053894	andpd	%xmm1, %xmm0
0000000000053898	movq	%rbx, %rsi
000000000005389b	xorl	%edx, %edx
000000000005389d	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
00000000000538a2	addq	$0x1b8, %r14                    ## imm = 0x1B8
00000000000538a9	movsd	0x10(%r15), %xmm0
00000000000538af	andpd	0x5cad9(%rip), %xmm0
00000000000538b7	cmpnltsd	0x5caf0(%rip), %xmm0
00000000000538c0	movsd	0x5bc60(%rip), %xmm1
00000000000538c8	andpd	%xmm1, %xmm0
00000000000538cc	movq	%r14, %rdi
00000000000538cf	movq	%rbx, %rsi
00000000000538d2	xorl	%edx, %edx
00000000000538d4	addq	$0x8, %rsp
00000000000538d8	popq	%rbx
00000000000538d9	popq	%r14
00000000000538db	popq	%r15
00000000000538dd	popq	%rbp
00000000000538de	jmp	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
00000000000538e3	nop
