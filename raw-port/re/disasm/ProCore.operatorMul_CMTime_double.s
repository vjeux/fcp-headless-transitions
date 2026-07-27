__ZmlRK6CMTimed:
0000000000058142	pushq	%rbp
0000000000058143	movq	%rsp, %rbp
0000000000058146	pushq	%rbx
0000000000058147	subq	$0x38, %rsp
000000000005814b	movq	%rdi, %rbx
000000000005814e	movq	0x10(%rsi), %rax
0000000000058152	movq	%rax, -0x10(%rbp)
0000000000058156	movups	(%rsi), %xmm1
0000000000058159	movaps	%xmm1, -0x20(%rbp)
000000000005815d	movq	-0x10(%rbp), %rax
0000000000058161	movq	%rax, 0x10(%rsp)
0000000000058166	movaps	-0x20(%rbp), %xmm1
000000000005816a	movups	%xmm1, (%rsp)
000000000005816e	callq	0xde3d8                         ## symbol stub for: _CMTimeMultiplyByFloat64
0000000000058173	movq	%rbx, %rax
0000000000058176	addq	$0x38, %rsp
000000000005817a	popq	%rbx
000000000005817b	popq	%rbp
000000000005817c	retq
__ZmldRK6CMTime:
000000000005817d	pushq	%rbp
000000000005817e	movq	%rsp, %rbp
0000000000058181	pushq	%rbx
