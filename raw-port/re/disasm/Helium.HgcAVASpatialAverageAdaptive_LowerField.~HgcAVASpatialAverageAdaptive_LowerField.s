__ZN39HgcAVASpatialAverageAdaptive_LowerFieldD0Ev:
000000000021f270	pushq	%rbp
000000000021f271	movq	%rsp, %rbp
000000000021f274	pushq	%rbx
000000000021f275	pushq	%rax
000000000021f276	movq	%rdi, %rbx
000000000021f279	leaq	0x811ce8(%rip), %rax
000000000021f280	movq	%rax, (%rdi)
000000000021f283	movq	0x198(%rdi), %rax
000000000021f28a	testq	%rax, %rax
000000000021f28d	je	0x21f29d
000000000021f28f	movq	-0x8(%rax), %rdi
000000000021f293	testq	%rdi, %rdi
000000000021f296	je	0x21f29d
000000000021f298	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000021f29d	movq	%rbx, %rdi
000000000021f2a0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000021f2a5	movq	%rbx, %rdi
000000000021f2a8	addq	$0x8, %rsp
000000000021f2ac	popq	%rbx
000000000021f2ad	popq	%rbp
000000000021f2ae	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000021f2b3	nopw	%cs:(%rax,%rax)
