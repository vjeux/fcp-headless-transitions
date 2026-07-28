__ZN10OZHeCanvas8SetBoundERK6PCRectIiE:
00000000005a7190	pushq	%rbp
00000000005a7191	movq	%rsp, %rbp
00000000005a7194	movl	(%rsi), %eax
00000000005a7196	cvtsi2ss	%eax, %xmm0
00000000005a719a	movl	0x4(%rsi), %ecx
00000000005a719d	cvtsi2ss	%ecx, %xmm1
00000000005a71a1	addl	0x8(%rsi), %eax
00000000005a71a4	cvtsi2ss	%eax, %xmm2
00000000005a71a8	addl	0xc(%rsi), %ecx
00000000005a71ab	cvtsi2ss	%ecx, %xmm3
00000000005a71af	movq	(%rdi), %rax
00000000005a71b2	movq	0x60(%rax), %rax
00000000005a71b6	movl	$0x4, %esi
00000000005a71bb	popq	%rbp
00000000005a71bc	jmpq	*%rax
00000000005a71be	nop
