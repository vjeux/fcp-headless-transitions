__ZN16HGLinearFilter2D5resetEii:
000000000010bf50	pushq	%rbp
000000000010bf51	movq	%rsp, %rbp
000000000010bf54	pushq	%r15
000000000010bf56	pushq	%r14
000000000010bf58	pushq	%r13
000000000010bf5a	pushq	%r12
000000000010bf5c	pushq	%rbx
000000000010bf5d	pushq	%rax
000000000010bf5e	movq	%rdi, %rbx
000000000010bf61	testl	%esi, %esi
000000000010bf63	setne	%al
000000000010bf66	testl	%edx, %edx
000000000010bf68	setne	%cl
000000000010bf6b	testb	%cl, %al
000000000010bf6d	jne	0x10bf95
000000000010bf6f	testb	$0x2, 0x1c(%rbx)
000000000010bf73	je	0x10bf82
000000000010bf75	movq	(%rbx), %rdi
000000000010bf78	testq	%rdi, %rdi
000000000010bf7b	je	0x10bf82
000000000010bf7d	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
000000000010bf82	xorps	%xmm0, %xmm0
000000000010bf85	movups	%xmm0, (%rbx)
000000000010bf88	movq	$0x0, 0x10(%rbx)
000000000010bf90	jmp	0x10c070
000000000010bf95	movl	%edx, %r15d
000000000010bf98	imull	%esi, %r15d
000000000010bf9c	movl	0x14(%rbx), %eax
000000000010bf9f	imull	0x10(%rbx), %eax
000000000010bfa3	movl	%r15d, %r14d
000000000010bfa6	cmpl	%r15d, %eax
000000000010bfa9	je	0x10bfef
000000000010bfab	movl	%esi, %r12d
000000000010bfae	movl	%edx, %r13d
000000000010bfb1	testb	$0x2, 0x1c(%rbx)
000000000010bfb5	je	0x10bfc4
000000000010bfb7	movq	(%rbx), %rdi
000000000010bfba	testq	%rdi, %rdi
000000000010bfbd	je	0x10bfc4
000000000010bfbf	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
000000000010bfc4	movl	%r15d, 0x18(%rbx)
000000000010bfc8	movq	%r14, %rax
000000000010bfcb	shlq	$0x4, %rax
000000000010bfcf	testl	%r15d, %r15d
000000000010bfd2	movq	$-0x1, %rdi
000000000010bfd9	cmovnsq	%rax, %rdi
000000000010bfdd	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000010bfe2	movq	%rax, (%rbx)
000000000010bfe5	orb	$0x2, 0x1c(%rbx)
000000000010bfe9	movl	%r13d, %edx
000000000010bfec	movl	%r12d, %esi
000000000010bfef	movq	$0x0, 0x8(%rbx)
000000000010bff7	movl	%esi, 0x10(%rbx)
000000000010bffa	movl	%edx, 0x14(%rbx)
000000000010bffd	testl	%r15d, %r15d
000000000010c000	jle	0x10c070
000000000010c002	movl	%r14d, %eax
000000000010c005	andl	$0x3, %eax
000000000010c008	cmpl	$0x4, %r15d
000000000010c00c	jae	0x10c012
000000000010c00e	xorl	%ecx, %ecx
000000000010c010	jmp	0x10c04c
000000000010c012	andl	$0x7ffffffc, %r14d              ## imm = 0x7FFFFFFC
000000000010c019	xorl	%edx, %edx
000000000010c01b	xorps	%xmm0, %xmm0
000000000010c01e	xorl	%ecx, %ecx
000000000010c020	movq	(%rbx), %rsi
000000000010c023	movaps	%xmm0, (%rsi,%rdx)
000000000010c027	movq	(%rbx), %rsi
000000000010c02a	movaps	%xmm0, 0x10(%rsi,%rdx)
000000000010c02f	movq	(%rbx), %rsi
000000000010c032	movaps	%xmm0, 0x20(%rsi,%rdx)
000000000010c037	movq	(%rbx), %rsi
000000000010c03a	movaps	%xmm0, 0x30(%rsi,%rdx)
000000000010c03f	addq	$0x4, %rcx
000000000010c043	addq	$0x40, %rdx
000000000010c047	cmpq	%rcx, %r14
000000000010c04a	jne	0x10c020
000000000010c04c	testq	%rax, %rax
000000000010c04f	je	0x10c070
000000000010c051	shlq	$0x4, %rcx
000000000010c055	xorps	%xmm0, %xmm0
000000000010c058	nopl	(%rax,%rax)
000000000010c060	movq	(%rbx), %rdx
000000000010c063	movaps	%xmm0, (%rdx,%rcx)
000000000010c067	addq	$0x10, %rcx
000000000010c06b	decq	%rax
000000000010c06e	jne	0x10c060
000000000010c070	addq	$0x8, %rsp
000000000010c074	popq	%rbx
000000000010c075	popq	%r12
000000000010c077	popq	%r13
000000000010c079	popq	%r14
000000000010c07b	popq	%r15
000000000010c07d	popq	%rbp
000000000010c07e	retq
000000000010c07f	nop
