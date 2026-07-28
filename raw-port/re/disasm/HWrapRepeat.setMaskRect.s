__ZN11HWrapRepeat11setMaskRectERK6PCRectIdE:
0000000000470890	pushq	%rbp
0000000000470891	movq	%rsp, %rbp
0000000000470894	movups	(%rsi), %xmm0
0000000000470897	movups	0x10(%rsi), %xmm1
000000000047089b	movups	%xmm1, 0x1b0(%rdi)
00000000004708a2	movups	%xmm0, 0x1a0(%rdi)
00000000004708a9	movsd	(%rsi), %xmm0
00000000004708ad	movsd	0x8(%rsi), %xmm1
00000000004708b2	cvtsd2ss	%xmm0, %xmm0
00000000004708b6	cvtsd2ss	%xmm1, %xmm1
00000000004708ba	movsd	0x10(%rsi), %xmm2
00000000004708bf	cvtsd2ss	%xmm2, %xmm2
00000000004708c3	movsd	0x18(%rsi), %xmm3
00000000004708c8	cvtsd2ss	%xmm3, %xmm3
00000000004708cc	movq	(%rdi), %rax
00000000004708cf	movq	0x60(%rax), %rax
00000000004708d3	xorl	%esi, %esi
00000000004708d5	popq	%rbp
00000000004708d6	jmpq	*%rax
00000000004708d8	nopl	(%rax,%rax)
