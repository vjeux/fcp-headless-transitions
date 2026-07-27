
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000003ea46 <__ZN15OZDynamicVertex9getValueVERK6CMTime>:
   3ea46: 55                           	pushq	%rbp
   3ea47: 48 89 e5                     	movq	%rsp, %rbp
   3ea4a: 48 81 c7 50 01 00 00         	addq	$0x150, %rdi            ## imm = 0x150
   3ea51: 0f 57 c0                     	xorps	%xmm0, %xmm0
   3ea54: 5d                           	popq	%rbp
   3ea55: e9 f4 72 fd ff               	jmp	0x15d4e <__ZNK9OZChannel16getValueAsDoubleERK6CMTimed>
