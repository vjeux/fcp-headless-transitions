__ZNK26PCIllegalArgumentException9classNameEv:
000000000002c038	pushq	%rbp
000000000002c039	movq	%rsp, %rbp
000000000002c03c	pushq	%rbx
000000000002c03d	pushq	%rax
000000000002c03e	movq	%rdi, %rbx
000000000002c041	leaq	0x121070(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000002c048	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
000000000002c04d	movq	%rbx, %rax
000000000002c050	addq	$0x8, %rsp
000000000002c054	popq	%rbx
000000000002c055	popq	%rbp
000000000002c056	retq
000000000002c057	nop
