__ZN31HgcBilateralFilterInterp_DivideD0Ev:
000000000031ace0	pushq	%rbp
000000000031ace1	movq	%rsp, %rbp
000000000031ace4	pushq	%rbx
000000000031ace5	pushq	%rax
000000000031ace6	movq	%rdi, %rbx
000000000031ace9	leaq	0x727cc8(%rip), %rax
000000000031acf0	movq	%rax, (%rdi)
000000000031acf3	movq	0x198(%rdi), %rax
000000000031acfa	testq	%rax, %rax
000000000031acfd	je	0x31ad0d
000000000031acff	movq	-0x8(%rax), %rdi
000000000031ad03	testq	%rdi, %rdi
000000000031ad06	je	0x31ad0d
000000000031ad08	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000031ad0d	movq	%rbx, %rdi
000000000031ad10	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000031ad15	movq	%rbx, %rdi
000000000031ad18	addq	$0x8, %rsp
000000000031ad1c	popq	%rbx
000000000031ad1d	popq	%rbp
000000000031ad1e	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000031ad23	nopw	%cs:(%rax,%rax)
