__ZN44HgcBilateralFilterInterpSC_InterpolatorLastX12GetParameterEiPf:
000000000031d060	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000031d065	testl	%esi, %esi
000000000031d067	je	0x31d06a
000000000031d069	retq
000000000031d06a	pushq	%rbp
000000000031d06b	movq	%rsp, %rbp
000000000031d06e	movq	0x198(%rdi), %rax
000000000031d075	movss	(%rax), %xmm0
000000000031d079	movss	%xmm0, (%rdx)
000000000031d07d	movss	0x4(%rax), %xmm0
000000000031d082	movss	%xmm0, 0x4(%rdx)
000000000031d087	movss	0x8(%rax), %xmm0
000000000031d08c	movss	%xmm0, 0x8(%rdx)
000000000031d091	movss	0xc(%rax), %xmm0
000000000031d096	movss	%xmm0, 0xc(%rdx)
000000000031d09b	xorl	%eax, %eax
000000000031d09d	popq	%rbp
000000000031d09e	retq
000000000031d09f	nop
