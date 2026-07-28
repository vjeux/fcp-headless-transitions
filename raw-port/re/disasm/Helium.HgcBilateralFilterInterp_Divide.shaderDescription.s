__ZNK31HgcBilateralFilterInterp_Divide17shaderDescriptionEv:
000000000031a600	pushq	%rbp
000000000031a601	movq	%rsp, %rbp
000000000031a604	pushq	%rbx
000000000031a605	pushq	%rax
000000000031a606	movq	%rdi, %rbx
000000000031a609	movl	$0x28, %edi
000000000031a60e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000031a613	movq	%rax, 0x10(%rbx)
000000000031a617	movq	$0x29, (%rbx)
000000000031a61e	movq	$0x26, 0x8(%rbx)
000000000031a626	movabsq	$0x5d316367685b2065, %rcx       ## imm = 0x5D316367685B2065
000000000031a630	movq	%rcx, 0x1e(%rax)
000000000031a634	movups	0x67c252(%rip), %xmm0           ## literal pool for: "erInterp_Divide [hgc1]"
000000000031a63b	movups	%xmm0, 0x10(%rax)
000000000031a63f	movups	0x67c237(%rip), %xmm0           ## literal pool for: "HgcBilateralFilterInterp_Divide [hgc1]"
000000000031a646	movups	%xmm0, (%rax)
000000000031a649	movb	$0x0, 0x26(%rax)
000000000031a64d	movq	%rbx, %rax
000000000031a650	addq	$0x8, %rsp
000000000031a654	popq	%rbx
000000000031a655	popq	%rbp
000000000031a656	retq
000000000031a657	nopw	(%rax,%rax)
