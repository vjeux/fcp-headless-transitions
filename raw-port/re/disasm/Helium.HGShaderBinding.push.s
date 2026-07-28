__ZN15HGShaderBinding4pushERKS_:
00000000000a77f0	pushq	%rbp
00000000000a77f1	movq	%rsp, %rbp
00000000000a77f4	movl	(%rsi), %eax
00000000000a77f6	addl	%eax, (%rdi)
00000000000a77f8	movdqu	0x4(%rsi), %xmm0
00000000000a77fd	movdqu	0x4(%rdi), %xmm1
00000000000a7802	paddd	%xmm0, %xmm1
00000000000a7806	movdqu	%xmm1, 0x4(%rdi)
00000000000a780b	movq	0x14(%rsi), %xmm0
00000000000a7810	movq	0x14(%rdi), %xmm1
00000000000a7815	paddd	%xmm0, %xmm1
00000000000a7819	movq	%xmm1, 0x14(%rdi)
00000000000a781e	movl	0x18(%rsi), %eax
00000000000a7821	addl	%eax, 0x1c(%rdi)
00000000000a7824	popq	%rbp
00000000000a7825	retq
00000000000a7826	nopw	%cs:(%rax,%rax)
