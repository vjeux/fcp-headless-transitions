__ZN39HgcAVASpatialAverageAdaptive_LowerField11BindTextureEP9HGHandleri:
000000000021d6d0	pushq	%rbp
000000000021d6d1	movq	%rsp, %rbp
000000000021d6d4	pushq	%rbx
000000000021d6d5	pushq	%rax
000000000021d6d6	movq	%rsi, %rbx
000000000021d6d9	testl	%edx, %edx
000000000021d6db	je	0x21d91a
000000000021d6e1	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000021d6e6	cmpl	$0x1, %edx
000000000021d6e9	jne	0x21da02
000000000021d6ef	movq	(%rbx), %rax
000000000021d6f2	movq	%rbx, %rdi
000000000021d6f5	movl	$0x1, %esi
000000000021d6fa	xorl	%edx, %edx
000000000021d6fc	callq	*0x48(%rax)
000000000021d6ff	movq	(%rbx), %rax
000000000021d702	movq	%rbx, %rdi
000000000021d705	xorl	%esi, %esi
000000000021d707	xorl	%edx, %edx
000000000021d709	callq	*0x30(%rax)
000000000021d70c	movq	%rbx, %rdi
000000000021d70f	movl	$0x1, %esi
000000000021d714	xorl	%edx, %edx
000000000021d716	xorl	%ecx, %ecx
000000000021d718	xorl	%r8d, %r8d
000000000021d71b	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d720	movq	(%rbx), %rax
000000000021d723	movsd	0x1acbd5(%rip), %xmm1
000000000021d72b	xorps	%xmm0, %xmm0
000000000021d72e	xorps	%xmm2, %xmm2
000000000021d731	movq	%rbx, %rdi
000000000021d734	callq	*0x60(%rax)
000000000021d737	movq	%rbx, %rdi
000000000021d73a	movl	$0x3, %esi
000000000021d73f	xorl	%edx, %edx
000000000021d741	xorl	%ecx, %ecx
000000000021d743	xorl	%r8d, %r8d
000000000021d746	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d74b	movq	0x90(%rbx), %rdi
000000000021d752	movq	(%rdi), %rax
000000000021d755	movl	$0x2e, %esi
000000000021d75a	callq	*0x80(%rax)
000000000021d760	testl	%eax, %eax
000000000021d762	jne	0x21d770
000000000021d764	movq	(%rbx), %rax
000000000021d767	movq	%rbx, %rdi
000000000021d76a	callq	*0xa8(%rax)
000000000021d770	movq	(%rbx), %rax
000000000021d773	movsd	0x1acae5(%rip), %xmm0
000000000021d77b	movsd	0x1acb7d(%rip), %xmm1
000000000021d783	xorps	%xmm2, %xmm2
000000000021d786	movq	%rbx, %rdi
000000000021d789	callq	*0x60(%rax)
000000000021d78c	movq	%rbx, %rdi
000000000021d78f	movl	$0x2, %esi
000000000021d794	xorl	%edx, %edx
000000000021d796	xorl	%ecx, %ecx
000000000021d798	xorl	%r8d, %r8d
000000000021d79b	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d7a0	movq	0x90(%rbx), %rdi
000000000021d7a7	movq	(%rdi), %rax
000000000021d7aa	movl	$0x2e, %esi
000000000021d7af	callq	*0x80(%rax)
000000000021d7b5	testl	%eax, %eax
000000000021d7b7	jne	0x21d7c5
000000000021d7b9	movq	(%rbx), %rax
000000000021d7bc	movq	%rbx, %rdi
000000000021d7bf	callq	*0xa8(%rax)
000000000021d7c5	movq	(%rbx), %rax
000000000021d7c8	movsd	0x1acb30(%rip), %xmm0
000000000021d7d0	xorps	%xmm1, %xmm1
000000000021d7d3	xorps	%xmm2, %xmm2
000000000021d7d6	movq	%rbx, %rdi
000000000021d7d9	callq	*0x60(%rax)
000000000021d7dc	movq	%rbx, %rdi
000000000021d7df	movl	$0x5, %esi
000000000021d7e4	xorl	%edx, %edx
000000000021d7e6	xorl	%ecx, %ecx
000000000021d7e8	xorl	%r8d, %r8d
000000000021d7eb	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d7f0	movq	0x90(%rbx), %rdi
000000000021d7f7	movq	(%rdi), %rax
000000000021d7fa	movl	$0x2e, %esi
000000000021d7ff	callq	*0x80(%rax)
000000000021d805	testl	%eax, %eax
000000000021d807	jne	0x21d815
000000000021d809	movq	(%rbx), %rax
000000000021d80c	movq	%rbx, %rdi
000000000021d80f	callq	*0xa8(%rax)
000000000021d815	movq	(%rbx), %rax
000000000021d818	movsd	0x1ad970(%rip), %xmm0
000000000021d820	movsd	0x1acad8(%rip), %xmm1
000000000021d828	xorps	%xmm2, %xmm2
000000000021d82b	movq	%rbx, %rdi
000000000021d82e	callq	*0x60(%rax)
000000000021d831	movq	%rbx, %rdi
000000000021d834	movl	$0x4, %esi
000000000021d839	xorl	%edx, %edx
000000000021d83b	xorl	%ecx, %ecx
000000000021d83d	xorl	%r8d, %r8d
000000000021d840	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d845	movq	0x90(%rbx), %rdi
000000000021d84c	movq	(%rdi), %rax
000000000021d84f	movl	$0x2e, %esi
000000000021d854	callq	*0x80(%rax)
000000000021d85a	testl	%eax, %eax
000000000021d85c	jne	0x21d86a
000000000021d85e	movq	(%rbx), %rax
000000000021d861	movq	%rbx, %rdi
000000000021d864	callq	*0xa8(%rax)
000000000021d86a	movq	(%rbx), %rax
000000000021d86d	movsd	0x1b36b3(%rip), %xmm0
000000000021d875	xorps	%xmm1, %xmm1
000000000021d878	xorps	%xmm2, %xmm2
000000000021d87b	movq	%rbx, %rdi
000000000021d87e	callq	*0x60(%rax)
000000000021d881	movq	%rbx, %rdi
000000000021d884	movl	$0x6, %esi
000000000021d889	xorl	%edx, %edx
000000000021d88b	xorl	%ecx, %ecx
000000000021d88d	xorl	%r8d, %r8d
000000000021d890	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021d895	movq	0x90(%rbx), %rdi
000000000021d89c	movq	(%rdi), %rax
000000000021d89f	movl	$0x2e, %esi
000000000021d8a4	callq	*0x80(%rax)
000000000021d8aa	testl	%eax, %eax
000000000021d8ac	jne	0x21d8ba
000000000021d8ae	movq	(%rbx), %rax
000000000021d8b1	movq	%rbx, %rdi
000000000021d8b4	callq	*0xa8(%rax)
000000000021d8ba	movq	(%rbx), %rax
000000000021d8bd	movsd	0x1af48b(%rip), %xmm0
000000000021d8c5	movsd	0x1aca33(%rip), %xmm1
000000000021d8cd	xorps	%xmm2, %xmm2
000000000021d8d0	movq	%rbx, %rdi
000000000021d8d3	callq	*0x60(%rax)
000000000021d8d6	movq	0x90(%rbx), %rdi
000000000021d8dd	movq	(%rdi), %rax
000000000021d8e0	movl	$0x2e, %esi
000000000021d8e5	callq	*0x80(%rax)
000000000021d8eb	xorps	%xmm0, %xmm0
000000000021d8ee	cvtsi2ssl	0xf0(%rbx), %xmm0
000000000021d8f6	xorps	%xmm1, %xmm1
000000000021d8f9	cvtsi2ssl	0xf4(%rbx), %xmm1
000000000021d901	testl	%eax, %eax
000000000021d903	je	0x21d978
000000000021d905	movq	(%rbx), %rax
000000000021d908	movss	0x1aa3b0(%rip), %xmm2
000000000021d910	movq	%rbx, %rdi
000000000021d913	movl	$0x2, %esi
000000000021d918	jmp	0x21d970
000000000021d91a	movq	(%rbx), %rax
000000000021d91d	movq	%rbx, %rdi
000000000021d920	xorl	%esi, %esi
000000000021d922	xorl	%edx, %edx
000000000021d924	callq	*0x48(%rax)
000000000021d927	movq	(%rbx), %rax
000000000021d92a	movq	%rbx, %rdi
000000000021d92d	xorl	%esi, %esi
000000000021d92f	xorl	%edx, %edx
000000000021d931	callq	*0x30(%rax)
000000000021d934	movq	0x90(%rbx), %rdi
000000000021d93b	movq	(%rdi), %rax
000000000021d93e	movl	$0x2e, %esi
000000000021d943	callq	*0x80(%rax)
000000000021d949	cvtsi2ssl	0xf0(%rbx), %xmm0
000000000021d951	cvtsi2ssl	0xf4(%rbx), %xmm1
000000000021d959	testl	%eax, %eax
000000000021d95b	je	0x21d9ba
000000000021d95d	movq	(%rbx), %rax
000000000021d960	movss	0x1aa358(%rip), %xmm2
000000000021d968	movq	%rbx, %rdi
000000000021d96b	movl	$0x1, %esi
000000000021d970	movaps	%xmm2, %xmm3
000000000021d973	jmp	0x21d9fa
000000000021d978	movl	0xe4(%rbx), %eax
000000000021d97e	subl	0xdc(%rbx), %eax
000000000021d984	cvtsi2ss	%rax, %xmm4
000000000021d989	movl	0xe8(%rbx), %eax
000000000021d98f	subl	0xe0(%rbx), %eax
000000000021d995	movss	0x1aa323(%rip), %xmm3
000000000021d99d	cvtsi2ss	%rax, %xmm5
000000000021d9a2	movaps	%xmm3, %xmm2
000000000021d9a5	divss	%xmm4, %xmm2
000000000021d9a9	divss	%xmm5, %xmm3
000000000021d9ad	movq	(%rbx), %rax
000000000021d9b0	movq	%rbx, %rdi
000000000021d9b3	movl	$0x2, %esi
000000000021d9b8	jmp	0x21d9fa
000000000021d9ba	movl	0xe4(%rbx), %eax
000000000021d9c0	subl	0xdc(%rbx), %eax
000000000021d9c6	cvtsi2ss	%rax, %xmm4
000000000021d9cb	movl	0xe8(%rbx), %eax
000000000021d9d1	subl	0xe0(%rbx), %eax
000000000021d9d7	movss	0x1aa2e1(%rip), %xmm3
000000000021d9df	cvtsi2ss	%rax, %xmm5
000000000021d9e4	movaps	%xmm3, %xmm2
000000000021d9e7	divss	%xmm4, %xmm2
000000000021d9eb	divss	%xmm5, %xmm3
000000000021d9ef	movq	(%rbx), %rax
000000000021d9f2	movq	%rbx, %rdi
000000000021d9f5	movl	$0x1, %esi
000000000021d9fa	callq	*0x88(%rax)
000000000021da00	xorl	%eax, %eax
000000000021da02	addq	$0x8, %rsp
000000000021da06	popq	%rbx
000000000021da07	popq	%rbp
000000000021da08	retq
000000000021da09	nopl	(%rax)
