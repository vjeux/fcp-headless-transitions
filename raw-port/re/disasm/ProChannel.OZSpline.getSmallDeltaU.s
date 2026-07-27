
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002fe52 <__ZNK8OZSpline14getSmallDeltaUEv>:
   2fe52: 55                           	pushq	%rbp
   2fe53: 48 89 e5                     	movq	%rsp, %rbp
   2fe56: 53                           	pushq	%rbx
   2fe57: 50                           	pushq	%rax
   2fe58: 48 89 fb                     	movq	%rdi, %rbx
   2fe5b: 48 8b 86 a8 00 00 00         	movq	0xa8(%rsi), %rax
   2fe62: 80 38 00                     	cmpb	$0x0, (%rax)
   2fe65: b8 01 00 00 00               	movl	$0x1, %eax
   2fe6a: ba 64 00 00 00               	movl	$0x64, %edx
   2fe6f: 0f 45 d0                     	cmovnel	%eax, %edx
   2fe72: be 01 00 00 00               	movl	$0x1, %esi
   2fe77: e8 16 cc 07 00               	callq	0xaca92 <_tan+0xaca92>
   2fe7c: 48 89 d8                     	movq	%rbx, %rax
   2fe7f: 48 83 c4 08                  	addq	$0x8, %rsp
   2fe83: 5b                           	popq	%rbx
   2fe84: 5d                           	popq	%rbp
   2fe85: c3                           	retq
