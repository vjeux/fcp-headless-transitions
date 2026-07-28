__ZN31HGInterlaceHandler_ExtractField13SetWhichFieldENS_31hgInterlaceHandler_ExtractFieldE:
0000000000092fe0	pushq	%rbp
0000000000092fe1	movq	%rsp, %rbp
0000000000092fe4	movl	%esi, %eax
0000000000092fe6	cvtsi2ss	%rax, %xmm0
0000000000092feb	movq	(%rdi), %rax
0000000000092fee	movq	0x60(%rax), %rax
0000000000092ff2	xorps	%xmm1, %xmm1
0000000000092ff5	xorps	%xmm2, %xmm2
0000000000092ff8	xorps	%xmm3, %xmm3
0000000000092ffb	xorl	%esi, %esi
0000000000092ffd	popq	%rbp
0000000000092ffe	jmpq	*%rax
