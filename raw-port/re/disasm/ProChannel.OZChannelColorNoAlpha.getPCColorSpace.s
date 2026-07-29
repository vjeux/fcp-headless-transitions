__ZNK21OZChannelColorNoAlpha15getPCColorSpaceEv:
00000000000564dc	pushq	%rbp
00000000000564dd	movq	%rsp, %rbp
00000000000564e0	pushq	%rbx
00000000000564e1	pushq	%rax
00000000000564e2	movq	%rdi, %rbx
00000000000564e5	leaq	0x2e8(%rsi), %rdi
00000000000564ec	movq	0x73fcd(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000564f3	xorps	%xmm0, %xmm0
00000000000564f6	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
00000000000564fb	movl	%eax, %edi
00000000000564fd	movl	$0x3, %esi
0000000000056502	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056507	movq	%rbx, %rdi
000000000005650a	cmpl	$-0x1, %eax
000000000005650d	je	0x56518
000000000005650f	movl	%eax, %esi
0000000000056511	callq	0xacbd0                         ## symbol stub for: __ZN17PCColorSpaceCache17getColorSpaceByIDENS_2IDE
0000000000056516	jmp	0x5651d
0000000000056518	callq	0xacbbe                         ## symbol stub for: __ZN17PCColorSpaceCache12defaultSpaceEv
000000000005651d	movq	%rbx, %rax
0000000000056520	addq	$0x8, %rsp
0000000000056524	popq	%rbx
0000000000056525	popq	%rbp
0000000000056526	retq
0000000000056527	nop
