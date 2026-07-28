__ZN39HgcAVASpatialAverageAdaptive_LowerField12GetParameterEiPf:
000000000021f330	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000021f335	testl	%esi, %esi
000000000021f337	je	0x21f33a
000000000021f339	retq
000000000021f33a	pushq	%rbp
000000000021f33b	movq	%rsp, %rbp
000000000021f33e	movq	0x198(%rdi), %rax
000000000021f345	movss	(%rax), %xmm0
000000000021f349	movss	%xmm0, (%rdx)
000000000021f34d	movss	0x4(%rax), %xmm0
000000000021f352	movss	%xmm0, 0x4(%rdx)
000000000021f357	movss	0x8(%rax), %xmm0
000000000021f35c	movss	%xmm0, 0x8(%rdx)
000000000021f361	movss	0xc(%rax), %xmm0
000000000021f366	movss	%xmm0, 0xc(%rdx)
000000000021f36b	xorl	%eax, %eax
000000000021f36d	popq	%rbp
000000000021f36e	retq
000000000021f36f	nop
