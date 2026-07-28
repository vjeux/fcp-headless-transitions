__ZN15HGShaderBinding3popERKS_:
00000000000a7830	pushq	%rbp
00000000000a7831	movq	%rsp, %rbp
00000000000a7834	movl	(%rsi), %eax
00000000000a7836	subl	%eax, (%rdi)
00000000000a7838	movdqu	0x4(%rsi), %xmm0
00000000000a783d	movdqu	0x4(%rdi), %xmm1
00000000000a7842	psubd	%xmm0, %xmm1
00000000000a7846	movdqu	%xmm1, 0x4(%rdi)
00000000000a784b	movq	0x14(%rsi), %xmm0
00000000000a7850	movq	0x14(%rdi), %xmm1
00000000000a7855	psubd	%xmm0, %xmm1
00000000000a7859	movq	%xmm1, 0x14(%rdi)
00000000000a785e	movl	0x18(%rsi), %eax
00000000000a7861	subl	%eax, 0x1c(%rdi)
00000000000a7864	popq	%rbp
00000000000a7865	retq
00000000000a7866	nopw	%cs:(%rax,%rax)
