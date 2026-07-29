__ZN5HGHLG8HLGToSDRC1ENS0_16ConversionMethodE:
00000000001007e0	pushq	%rbp
00000000001007e1	movq	%rsp, %rbp
00000000001007e4	pushq	%r14
00000000001007e6	pushq	%rbx
00000000001007e7	movl	%esi, %r14d
00000000001007ea	movq	%rdi, %rbx
00000000001007ed	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001007f2	leaq	0x917007(%rip), %rax
00000000001007f9	movq	%rax, (%rbx)
00000000001007fc	movq	$0x0, 0x198(%rbx)
0000000000100807	movw	$0x0, 0x1a0(%rbx)
0000000000100810	movl	%r14d, 0x1a4(%rbx)
0000000000100817	callq	__ZN12HGColorGamma25GetDefaultToneQualityModeEv ## HGColorGamma::GetDefaultToneQualityMode()
000000000010081c	movl	%eax, 0x1a8(%rbx)
0000000000100822	popq	%rbx
0000000000100823	popq	%r14
0000000000100825	popq	%rbp
0000000000100826	retq
0000000000100827	movq	%rax, %r14
000000000010082a	movq	%rbx, %rdi
000000000010082d	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000100832	movq	%r14, %rdi
0000000000100835	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010083a	nopw	(%rax,%rax)
