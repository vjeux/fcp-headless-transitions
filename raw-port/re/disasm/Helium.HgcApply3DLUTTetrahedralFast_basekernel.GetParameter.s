__ZN39HgcApply3DLUTTetrahedralFast_basekernel12GetParameterEiPf:
000000000038c110	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000038c115	cmpl	$0x3, %esi
000000000038c118	ja	0x38c158
000000000038c11a	pushq	%rbp
000000000038c11b	movq	%rsp, %rbp
000000000038c11e	movq	0x198(%rdi), %rax
000000000038c125	movl	%esi, %ecx
000000000038c127	shlq	$0x5, %rcx
000000000038c12b	movss	(%rax,%rcx), %xmm0
000000000038c130	movss	%xmm0, (%rdx)
000000000038c134	movss	0x4(%rax,%rcx), %xmm0
000000000038c13a	movss	%xmm0, 0x4(%rdx)
000000000038c13f	movss	0x8(%rax,%rcx), %xmm0
000000000038c145	movss	%xmm0, 0x8(%rdx)
000000000038c14a	movss	0xc(%rax,%rcx), %xmm0
000000000038c150	movss	%xmm0, 0xc(%rdx)
000000000038c155	xorl	%eax, %eax
000000000038c157	popq	%rbp
000000000038c158	retq
000000000038c159	nopl	(%rax)
