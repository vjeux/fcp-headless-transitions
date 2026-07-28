__ZN42HgcApply3DLUTTetrahedralUniform_basekernelD0Ev:
000000000039ad80	pushq	%rbp
000000000039ad81	movq	%rsp, %rbp
000000000039ad84	pushq	%rbx
000000000039ad85	pushq	%rax
000000000039ad86	movq	%rdi, %rbx
000000000039ad89	leaq	0x6b7350(%rip), %rax
000000000039ad90	movq	%rax, (%rdi)
000000000039ad93	movq	0x198(%rdi), %rax
000000000039ad9a	testq	%rax, %rax
000000000039ad9d	je	0x39adad
000000000039ad9f	movq	-0x8(%rax), %rdi
000000000039ada3	testq	%rdi, %rdi
000000000039ada6	je	0x39adad
000000000039ada8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000039adad	movq	%rbx, %rdi
000000000039adb0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000039adb5	movq	%rbx, %rdi
000000000039adb8	addq	$0x8, %rsp
000000000039adbc	popq	%rbx
000000000039adbd	popq	%rbp
000000000039adbe	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000039adc3	nopw	%cs:(%rax,%rax)
