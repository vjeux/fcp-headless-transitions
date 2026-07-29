-[FFSonySLog2SGamutProcessingInfo initWithExposureIndex:isoSensitivity:whiteBalance:]:
000000000075c770	pushq	%rbp
000000000075c771	movq	%rsp, %rbp
000000000075c774	pushq	%r15
000000000075c776	pushq	%r14
000000000075c778	pushq	%r12
000000000075c77a	pushq	%rbx
000000000075c77b	subq	$0x30, %rsp
000000000075c77f	movl	%r8d, %r14d
000000000075c782	movl	%ecx, %ebx
000000000075c784	movl	%edx, %r15d
000000000075c787	movq	0x119143a(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
000000000075c78e	movq	(%rax), %rax
000000000075c791	movq	%rax, -0x28(%rbp)
000000000075c795	movq	%rdi, -0x48(%rbp)
000000000075c799	movq	0x1295360(%rip), %rax           ## Objc class ref: bad class ref
000000000075c7a0	movq	%rax, -0x40(%rbp)
000000000075c7a4	movq	0x145bfed(%rip), %rsi
000000000075c7ab	leaq	-0x48(%rbp), %rdi
000000000075c7af	callq	0x149797a                       ## Objc message: -[[%rdi super] requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
000000000075c7b4	testq	%rax, %rax
000000000075c7b7	je	0x75c875
000000000075c7bd	testl	%r15d, %r15d
000000000075c7c0	movl	$0x4e2, %ecx                    ## imm = 0x4E2
000000000075c7c5	cmovel	%ecx, %r15d
000000000075c7c9	movq	_OBJC_IVAR_$_FFLogProcessingInfo._processingMode(%rip), %rdx
000000000075c7d0	testl	%ebx, %ebx
000000000075c7d2	cmovel	%ecx, %ebx
000000000075c7d5	cvtsi2sd	%r15, %xmm0
000000000075c7da	cvtsi2sd	%rbx, %xmm1
000000000075c7df	movl	$0x21, (%rax,%rdx)
000000000075c7e6	divsd	%xmm1, %xmm0
000000000075c7ea	cvtsd2ss	%xmm0, %xmm0
000000000075c7ee	movq	_OBJC_IVAR_$_FFSonySLog2SGamutProcessingInfo._exposureGain(%rip), %rcx
000000000075c7f5	movss	%xmm0, (%rax,%rcx)
000000000075c7fa	decl	%r14d
000000000075c7fd	cmpl	$0x1387, %r14d                  ## imm = 0x1387
000000000075c804	movq	_OBJC_IVAR_$_FFSonySLog2SGamutProcessingInfo._useTungstenMatrix(%rip), %rcx
000000000075c80b	movq	%rax, %r12
000000000075c80e	setb	(%rax,%rcx)
000000000075c812	movl	%r15d, %eax
000000000075c815	movl	%ebx, %edx
000000000075c817	nopw	(%rax,%rax)
000000000075c820	movl	%edx, %esi
000000000075c822	xorl	%edx, %edx
000000000075c824	divl	%esi
000000000075c826	movl	%esi, %eax
000000000075c828	testl	%edx, %edx
000000000075c82a	jne	0x75c820
000000000075c82c	xorl	%edi, %edi
000000000075c82e	cmpl	$0x1387, %r14d                  ## imm = 0x1387
000000000075c835	setb	%dil
000000000075c839	movl	%r15d, %eax
000000000075c83c	xorl	%edx, %edx
000000000075c83e	divl	%esi
000000000075c840	movl	%eax, %ecx
000000000075c842	movl	%ebx, %eax
000000000075c844	xorl	%edx, %edx
000000000075c846	divl	%esi
000000000075c848	movl	%ecx, -0x34(%rbp)
000000000075c84b	movl	%eax, -0x30(%rbp)
000000000075c84e	movl	%edi, -0x2c(%rbp)
000000000075c851	leaq	-0x34(%rbp), %rdi
000000000075c855	movl	$0xc, %esi
000000000075c85a	callq	_FFMD5WithBytes
000000000075c85f	movq	%rax, %rcx
000000000075c862	movq	_OBJC_IVAR_$_FFLogProcessingInfo._parametersMD5(%rip), %rsi
000000000075c869	movq	%r12, %rax
000000000075c86c	movq	%rcx, (%r12,%rsi)
000000000075c870	movq	%rdx, 0x8(%r12,%rsi)
000000000075c875	movq	0x119134c(%rip), %rcx           ## literal pool symbol address: ___stack_chk_guard
000000000075c87c	movq	(%rcx), %rcx
000000000075c87f	cmpq	-0x28(%rbp), %rcx
000000000075c883	jne	0x75c892
000000000075c885	addq	$0x30, %rsp
000000000075c889	popq	%rbx
000000000075c88a	popq	%r12
000000000075c88c	popq	%r14
000000000075c88e	popq	%r15
000000000075c890	popq	%rbp
000000000075c891	retq
000000000075c892	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
000000000075c897	nopw	(%rax,%rax)
