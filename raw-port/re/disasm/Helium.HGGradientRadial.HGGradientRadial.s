__ZN16HGGradientRadialC1Ev:
000000000008bdb0	pushq	%rbp
000000000008bdb1	movq	%rsp, %rbp
000000000008bdb4	pushq	%r14
000000000008bdb6	pushq	%rbx
000000000008bdb7	movq	%rdi, %rbx
000000000008bdba	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000008bdbf	leaq	0x97e21a(%rip), %rax
000000000008bdc6	movq	%rax, (%rbx)
000000000008bdc9	movq	$0x0, 0x1a0(%rbx)
000000000008bdd4	movq	%rbx, %rdi
000000000008bdd7	xorl	%esi, %esi
000000000008bdd9	movl	$0x5, %edx
000000000008bdde	callq	__ZN6HGNode8SetFlagsEii         ## HGNode::SetFlags(int, int)
000000000008bde3	orl	$0x601, 0x10(%rbx)              ## imm = 0x601
000000000008bdea	movl	$0x3, 0x198(%rbx)
000000000008bdf4	popq	%rbx
000000000008bdf5	popq	%r14
000000000008bdf7	popq	%rbp
000000000008bdf8	retq
000000000008bdf9	movq	%rax, %r14
000000000008bdfc	movq	0x1a0(%rbx), %rdi
000000000008be03	testq	%rdi, %rdi
000000000008be06	je	0x8be0e
000000000008be08	movq	(%rdi), %rax
000000000008be0b	callq	*0x18(%rax)
000000000008be0e	movq	%rbx, %rdi
000000000008be11	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000008be16	movq	%r14, %rdi
000000000008be19	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000008be1e	movq	%rax, %rdi
000000000008be21	callq	___clang_call_terminate
000000000008be26	nopw	%cs:(%rax,%rax)
