__ZNK44HgcBilateralFilterInterpSC_InterpolatorLastX17shaderDescriptionEv:
000000000031c7b0	pushq	%rbp
000000000031c7b1	movq	%rsp, %rbp
000000000031c7b4	pushq	%rbx
000000000031c7b5	pushq	%rax
000000000031c7b6	movq	%rdi, %rbx
000000000031c7b9	movl	$0x38, %edi
000000000031c7be	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000031c7c3	movq	%rax, 0x10(%rbx)
000000000031c7c7	movq	$0x39, (%rbx)
000000000031c7ce	movq	$0x33, 0x8(%rbx)
000000000031c7d6	movups	0x67b278(%rip), %xmm0           ## literal pool for: "polatorLastX [hgc1]"
000000000031c7dd	movups	%xmm0, 0x20(%rax)
000000000031c7e1	movups	0x67b25d(%rip), %xmm0           ## literal pool for: "erInterpSC_InterpolatorLastX [hgc1]"
000000000031c7e8	movups	%xmm0, 0x10(%rax)
000000000031c7ec	movups	0x67b242(%rip), %xmm0           ## literal pool for: "HgcBilateralFilterInterpSC_InterpolatorLastX [hgc1]"
000000000031c7f3	movups	%xmm0, (%rax)
000000000031c7f6	movl	$0x5d316367, 0x2f(%rax)         ## imm = 0x5D316367
000000000031c7fd	movb	$0x0, 0x33(%rax)
000000000031c801	movq	%rbx, %rax
000000000031c804	addq	$0x8, %rsp
000000000031c808	popq	%rbx
000000000031c809	popq	%rbp
000000000031c80a	retq
000000000031c80b	nopl	(%rax,%rax)
